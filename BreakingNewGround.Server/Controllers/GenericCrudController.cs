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
        private readonly string[] _includes;
        private readonly ILogger<GenericCrudController<T>> _logger;

        protected GenericCrudController(
            IGenericCrudService<T> genericCrudService,
            ILogger<GenericCrudController<T>> logger,
            params string[] includes)
        {
            _genericCrudService = genericCrudService;
            _logger = logger;
            _includes = includes;
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
            return await _genericCrudService.GetByIdAsync(id, _includes);
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<PagedResult<T>> GetAllAsync([FromBody] GetRequest request)
        {
            return await _genericCrudService.GetAllAsync(request, _includes);
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