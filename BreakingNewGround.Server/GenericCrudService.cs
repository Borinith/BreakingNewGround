using BreakingNewGround.Server.DAL.Data;
using BreakingNewGround.Server.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
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

        public async Task<T> GetByIdAsync(long id)
        {
            var entity = await _context.Set<T>().FindAsync(id);

            if (entity is null)
            {
                throw new Exception("Not found");
            }

            return entity;
        }

        public async Task<T[]> GetAllAsync()
        {
            return await _context.Set<T>().AsNoTracking().ToArrayAsync();
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
    }
}