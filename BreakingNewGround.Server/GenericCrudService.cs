using BreakingNewGround.Server.DAL.Data;
using BreakingNewGround.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
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
            var query = ApplyIncludes(_context.Set<T>().AsNoTracking(), includes);
            var lambda = ExtractByValue("Id", id);

            var entity = await query.FirstOrDefaultAsync(lambda);

            if (entity is null)
            {
                throw new Exception("Not found");
            }

            return entity;
        }

        public async Task<T[]> GetAllAsync(string[] includes)
        {
            var query = ApplyIncludes(_context.Set<T>().AsNoTracking(), includes);

            return await query.ToArrayAsync();
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

        private static Expression<Func<T, bool>> ExtractByValue<TValue>(string property, TValue value)
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            var constant = Expression.Constant(value);
            var body = Expression.Equal(Expression.Property(parameter, property), constant);

            return Expression.Lambda<Func<T, bool>>(body, parameter);
        }
    }
}