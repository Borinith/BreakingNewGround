using BreakingNewGround.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Controllers
{
    [SuppressMessage("ReSharper", "RouteTemplates.ActionRoutePrefixCanBeExtractedToControllerRoute")]
    public abstract class GenericCrudController<T> : Controller
        where T : class
    {
        private readonly IGenericCrudService<T> _genericCrudService;
        private readonly ILogger<GenericCrudController<T>> _logger;

        protected GenericCrudController(IGenericCrudService<T> genericCrudService, ILogger<GenericCrudController<T>> logger)
        {
            _genericCrudService = genericCrudService;
            _logger = logger;
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<T> CreateAsync(T model)
        {
            return await _genericCrudService.CreateAsync(model);
        }

        [HttpGet]
        [Route("[action]/{id:long}")]
        public async Task<T> GetByIdAsync(long id)
        {
            return await _genericCrudService.GetByIdAsync(id);
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<T[]> GetAllAsync()
        {
            return await _genericCrudService.GetAllAsync();
        }

        [HttpPut]
        [Route("[action]")]
        public async Task<T> UpdateAsync(T model)
        {
            return await _genericCrudService.UpdateAsync(model);
        }

        [HttpDelete]
        [Route("[action]/{id:long}")]
        public async Task<bool> DeleteAsync(long id)
        {
            return await _genericCrudService.DeleteAsync(id);
        }
    }
}