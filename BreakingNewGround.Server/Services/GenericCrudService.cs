using BreakingNewGround.Server.DAL.AzureSQL.Data;
using BreakingNewGround.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Services
{
    public class GenericCrudService<T> : IGenericCrudService<T>
        where T : class
    {
        private const string ID = "Id";
        private const string DESC = " desc";
        private const string JOIN_COLUMN = "JoinColumn";

        private readonly AppDbContext _context;
        private readonly ILogger<GenericCrudService<T>> _logger;

        public GenericCrudService(AppDbContext context, ILogger<GenericCrudService<T>> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<T> CreateAsync(T model)
        {
            await _context.Set<T>().AddAsync(model);
            await _context.SaveChangesAsync();

            return model;
        }

        public async Task<T> GetByIdAsync(long id, string[] includes)
        {
            var query = ApplyIncludes(_context.Set<T>(), includes).AsNoTracking();
            var lambda = GetLambdaWithExtractByValue(ID, ValueTypeEnum.Long, id, ComparisonEnum.Equal);

            var entity = await query.FirstOrDefaultAsync(lambda);

            if (entity is null)
            {
                throw new Exception("Not found");
            }

            return entity;
        }

        public async Task<Models.PagedResult<T>> GetAllAsync(GetRequest request, string[] includes)
        {
            var dbSet = _context.Set<T>();

            IQueryable<T> query;

            if (request.Order.HasValue
                && request.Order.Value.IsComplexSort
                && request.Order.Value.JoinTableName is not null
                && request.Order.Value.JoinTableColumnName is not null)
            {
                var entityType = _context.Model.FindEntityType(typeof(T));
                var tableName = entityType?.GetTableName() ?? string.Empty;

                var sqlQuery = $"""
                                SELECT [T].*, [J].{request.Order.Value.JoinTableColumnName.ToQuoted()} AS {JOIN_COLUMN}
                                FROM {tableName.ToQuoted()} AS T
                                LEFT JOIN {request.Order.Value.JoinTableName.ToQuoted()} J ON [J].[{ID}] = [T].{request.Order.Value.ColumnName.ToQuoted()}
                                """;

                query = ApplyIncludes(dbSet.FromSql(FormattableStringFactory.Create(sqlQuery)), includes).AsNoTracking();
            }
            else
            {
                query = ApplyIncludes(dbSet, includes).AsNoTracking();
            }

            if (request.Filters is not null)
            {
                foreach (var filter in request.Filters.Where(x => !string.IsNullOrWhiteSpace(x.Value)))
                {
                    query = query.Where(GetLambdaWithExtractByValue(filter.ColumnName, filter.ValueType, filter.Value, filter.Comparison));
                }
            }

            var total = await query.CountAsync();

            if (request.Order.HasValue)
            {
                var order = request.Order.Value.OrderBy == OrderByEnum.Ascending ? "" : DESC;

                if (request.Order.Value.IsComplexSort
                    && request.Order.Value.JoinTableName is not null
                    && request.Order.Value.JoinTableColumnName is not null
                   )
                {
                    var queryString = query.ToQueryString();

                    var orderby = $"\nORDER BY [{JOIN_COLUMN}]" + order;
                    const string offset = "\nOFFSET 0 ROWS";

                    query = dbSet.FromSql(FormattableStringFactory.Create(queryString + orderby + offset));
                }
                else
                {
                    query = query.OrderBy(request.Order.Value.ColumnName + order);
                }
            }

            if (request.Skip.HasValue)
            {
                query = query.Skip(request.Skip.Value);
            }

            if (request.Take.HasValue)
            {
                query = query.Take(request.Take.Value);
            }

            var items = await query.ToArrayAsync();

            return new Models.PagedResult<T>(items, total);
        }

        public async Task<T> UpdateAsync(T model)
        {
            _context.Set<T>().Update(model);
            await _context.SaveChangesAsync();

            return model;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var entity = await _context.Set<T>().FindAsync(id);

            if (entity is null)
            {
                return false;
            }

            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();

            return true;
        }

        private static IQueryable<T> ApplyIncludes(IQueryable<T> query, string[] includes)
        {
            return includes.Any()
                ? includes.Aggregate(query, (current, include) => current.Include(include))
                : query;
        }

        private static Expression<Func<T, bool>> GetLambdaWithExtractByValue<TValue>(string property, ValueTypeEnum valueType, TValue value, ComparisonEnum comparison)
        {
            if (value == null)
            {
                throw new ArgumentNullException(nameof(value));
            }

            var expressionParameter = Expression.Parameter(typeof(T), "x");
            var expressionProperty = Expression.Property(expressionParameter, property);

            var expressionConstant = valueType switch
            {
                ValueTypeEnum.Integer => Expression.Constant(Convert.ToInt32(value)),
                ValueTypeEnum.Long => Expression.Constant(Convert.ToInt64(value)),
                ValueTypeEnum.String => Expression.Constant(value.ToString()),
                ValueTypeEnum.DateTime => Expression.Constant(DateOnly.FromDateTime(Convert.ToDateTime(value))),
                ValueTypeEnum.Guid => Expression.Constant(Guid.Parse(value.ToString()!)),
                _ => throw new ArgumentOutOfRangeException(nameof(valueType), valueType, null)
            };

            var expressionConstantWithColumnType = Expression.Convert(expressionConstant, expressionProperty.Type);

            var body = comparison switch
            {
                ComparisonEnum.Equal => Expression.Equal(expressionProperty, expressionConstantWithColumnType),
                ComparisonEnum.NotEqual => Expression.NotEqual(expressionProperty, expressionConstantWithColumnType),
                ComparisonEnum.LessThan => Expression.LessThan(expressionProperty, expressionConstantWithColumnType),
                ComparisonEnum.LessThanOrEqual => Expression.LessThanOrEqual(expressionProperty, expressionConstantWithColumnType),
                ComparisonEnum.GreaterThan => Expression.GreaterThan(expressionProperty, expressionConstantWithColumnType),
                ComparisonEnum.GreaterThanOrEqual => Expression.GreaterThanOrEqual(expressionProperty, expressionConstantWithColumnType),
                ComparisonEnum.TextStartsWith => (Expression)Expression.Call(expressionProperty, typeof(string).GetMethod(nameof(string.StartsWith), [typeof(string)])!, expressionConstantWithColumnType),
                ComparisonEnum.FullTextSearch => Expression.Call(expressionProperty, typeof(string).GetMethod(nameof(string.StartsWith), [typeof(string)])!, expressionConstantWithColumnType),
                _ => throw new ArgumentOutOfRangeException(nameof(comparison), comparison, null)
            };

            return Expression.Lambda<Func<T, bool>>(body, expressionParameter);
        }
    }
}