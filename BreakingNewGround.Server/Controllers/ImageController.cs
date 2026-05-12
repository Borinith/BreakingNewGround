using BreakingNewGround.Server.Models;
using BreakingNewGround.Server.Models.Image;
using BreakingNewGround.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ImageController : ControllerBase
    {
        private const long MaxUploadSizeBytes = 5 * 1024 * 1024;

        private readonly IImageService _service;
        private readonly ILogger<ImageController> _logger;

        public ImageController(IImageService service, ILogger<ImageController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [Route("[action]")]
        public Task<PagedResult<ImageMetadataDto>> GetAll(
            [FromQuery] string? query,
            [FromQuery] int page,
            [FromQuery] int pageSize,
            CancellationToken cancellationToken)
        {
            if (pageSize <= 0)
            {
                pageSize = 20;
            }

            return _service.GetAllAsync(query, page, pageSize, cancellationToken);
        }

        [HttpGet]
        [Route("[action]/{id:guid}")]
        public async Task<ActionResult<ImageMetadataDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var image = await _service.GetByIdAsync(id, cancellationToken);

            if (image is null)
            {
                return NotFound();
            }

            return Ok(image);
        }

        [HttpGet]
        [Route("[action]/{id:guid}")]
        public async Task<IActionResult> GetThumbnail(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.GetThumbnailAsync(id, cancellationToken);

            if (result is null)
            {
                return NotFound();
            }

            Response.Headers.CacheControl = "public, max-age=31536000, immutable";

            return File(result.Value.Bytes, result.Value.ContentType);
        }

        [HttpGet]
        [Route("[action]/{id:guid}")]
        public async Task<IActionResult> GetOriginal(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.GetOriginalAsync(id, cancellationToken);

            if (result is null)
            {
                return NotFound();
            }

            Response.Headers.CacheControl = "public, max-age=31536000, immutable";

            return File(result.Value.Bytes, result.Value.ContentType, result.Value.FileName);
        }

        [HttpGet]
        [Route("[action]")]
        public Task<TagDto[]> GetAllTags(CancellationToken cancellationToken)
        {
            return _service.GetAllTagsAsync(cancellationToken);
        }

        [HttpGet]
        [Route("[action]")]
        public Task<string[]> SuggestTags([FromQuery] string query, CancellationToken cancellationToken)
        {
            return _service.SuggestTagsAsync(query, cancellationToken);
        }

        [HttpPost]
        [Route("[action]")]
        [RequestSizeLimit(MaxUploadSizeBytes)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxUploadSizeBytes)]
        public async Task<ActionResult<UploadResultDto>> Upload(
            [FromForm] IFormFile file,
            [FromForm] string[] tags,
            CancellationToken cancellationToken)
        {
            if (file is null || file.Length == 0)
            {
                return BadRequest("File is required");
            }

            if (file.Length > MaxUploadSizeBytes)
            {
                return BadRequest($"File exceeds {MaxUploadSizeBytes} bytes");
            }

            var result = await _service.UploadAsync(file, tags ?? [], cancellationToken);

            return Ok(result);
        }

        [HttpDelete]
        [Route("[action]/{id:guid}")]
        public async Task<bool> Delete(Guid id, CancellationToken cancellationToken)
        {
            return await _service.DeleteAsync(id, cancellationToken);
        }

        [HttpPut]
        [Route("[action]/{id:guid}")]
        public async Task<ActionResult<ImageMetadataDto>> SetTags(
            Guid id,
            [FromBody] string[] tags,
            CancellationToken cancellationToken)
        {
            var result = await _service.SetTagsAsync(id, tags ?? [], cancellationToken);

            if (result is null)
            {
                return NotFound();
            }

            return Ok(result);
        }
    }
}