using BreakingNewGround.Server.DAL.AzureSQL.Data;
using BreakingNewGround.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace BreakingNewGround.Server
{
    public class GenericCrudService<T> : IGenericCrudService<T>
        where T : class
    {
        private const string ID = "Id";
        private readonly MedicinesContext _context;
        private readonly ILogger<GenericCrudService<T>> _logger;

        public GenericCrudService(MedicinesContext context, ILogger<GenericCrudService<T>> logger)
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
            var query = ApplyIncludes(_context.Set<T>(), includes).AsNoTracking();
            
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
                query = request.Order.Value.OrderBy == OrderByEnum.Ascending
                    ? query.OrderBy(request.Order.Value.ColumnName)
                    : query.OrderBy(request.Order.Value.ColumnName + " desc");
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