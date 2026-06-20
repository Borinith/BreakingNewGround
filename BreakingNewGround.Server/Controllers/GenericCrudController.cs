using BreakingNewGround.Server.Models;
using BreakingNewGround.Server.Services;
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
        public async Task<ActionResult<T>> CreateAsync(T model, CancellationToken cancellationToken)
        {
            var result = await _genericCrudService.CreateAsync(model, cancellationToken);

            return Ok(result);
        }

        [HttpGet]
        [Route("[action]/{id:long}")]
        public async Task<ActionResult<T>> GetByIdAsync(long id, CancellationToken cancellationToken)
        {
            var result = await _genericCrudService.GetByIdAsync(id, _includes, cancellationToken);

            return result is not null ? Ok(result) : NotFound();
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<ActionResult<PagedResult<T>>> GetAllAsync([FromBody] GetRequest request, CancellationToken cancellationToken)
        {
            var result = await _genericCrudService.GetAllAsync(request, _includes, cancellationToken);

            return Ok(result);
        }

        [HttpPut]
        [Route("[action]")]
        public async Task<ActionResult<T>> UpdateAsync(T model, CancellationToken cancellationToken)
        {
            var result = await _genericCrudService.UpdateAsync(model, cancellationToken);

            return Ok(result);
        }

        [HttpDelete]
        [Route("[action]/{id:long}")]
        public async Task<ActionResult<bool>> DeleteAsync(long id, CancellationToken cancellationToken)
        {
            var result = await _genericCrudService.DeleteAsync(id, cancellationToken);

            return result ? Ok(result) : NotFound();
        }
    }
}