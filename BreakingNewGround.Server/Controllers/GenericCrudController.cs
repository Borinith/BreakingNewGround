using BreakingNewGround.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Controllers
{
    public abstract class GenericCrudController<T> : ControllerBase
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
        public async Task<T> CreateAsync(T model, CancellationToken cancellationToken)
        {
            return await _genericCrudService.CreateAsync(model, cancellationToken);
        }

        [HttpGet]
        [Route("[action]/{id:long}")]
        public async Task<T> GetByIdAsync(long id, CancellationToken cancellationToken)
        {
            return await _genericCrudService.GetByIdAsync(id, _includes, cancellationToken);
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<PagedResult<T>> GetAllAsync([FromBody] GetRequest request, CancellationToken cancellationToken)
        {
            return await _genericCrudService.GetAllAsync(request, _includes, cancellationToken);
        }

        [HttpPut]
        [Route("[action]")]
        public async Task<T> UpdateAsync(T model, CancellationToken cancellationToken)
        {
            return await _genericCrudService.UpdateAsync(model, cancellationToken);
        }

        [HttpDelete]
        [Route("[action]/{id:long}")]
        public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken)
        {
            return await _genericCrudService.DeleteAsync(id, cancellationToken);
        }
    }
}