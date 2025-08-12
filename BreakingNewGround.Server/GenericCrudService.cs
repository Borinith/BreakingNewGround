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
            var lambda = GetLambdaWithExtractByValue("Id", id, ComparisonEnum.Equal);

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
            var total = await query.CountAsync();

            if (request.Filters is not null)
            {
                foreach (var filter in request.Filters.Where(x => !string.IsNullOrWhiteSpace(x.Value)))
                {
                    query = query.Where(GetLambdaWithExtractByValue(filter.ColumnName, filter.Value, filter.Comparison));
                }
            }

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

        private static Expression<Func<T, bool>> GetLambdaWithExtractByValue<TValue>(string property, TValue value, ComparisonEnum comparison)
        {
            var expressionParameter = Expression.Parameter(typeof(T), "x");
            var expressionConstant = Expression.Constant(value);
            var expressionProperty = Expression.Property(expressionParameter, property);

            var body = comparison switch
            {
                ComparisonEnum.Equal => Expression.Equal(expressionProperty, expressionConstant),
                ComparisonEnum.NotEqual => Expression.NotEqual(expressionProperty, expressionConstant),
                ComparisonEnum.LessThan => Expression.LessThan(expressionProperty, expressionConstant),
                ComparisonEnum.LessThanOrEqual => Expression.LessThanOrEqual(expressionProperty, expressionConstant),
                ComparisonEnum.GreaterThan => Expression.GreaterThan(expressionProperty, expressionConstant),
                ComparisonEnum.GreaterThanOrEqual => Expression.GreaterThanOrEqual(expressionProperty, expressionConstant),
                ComparisonEnum.TextStartsWith => (Expression)Expression.Call(expressionProperty, typeof(string).GetMethod(nameof(string.StartsWith), [typeof(string)])!, expressionConstant),
                ComparisonEnum.FullTextSearch => Expression.Call(expressionProperty, typeof(string).GetMethod(nameof(string.StartsWith), [typeof(string)])!, expressionConstant),
                _ => throw new ArgumentOutOfRangeException(nameof(comparison), comparison, null)
            };

            return Expression.Lambda<Func<T, bool>>(body, expressionParameter);
        }
    }
}