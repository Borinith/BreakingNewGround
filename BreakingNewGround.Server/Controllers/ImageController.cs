using BreakingNewGround.Server.Attributes;
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
        private const long MaxUploadSizeBytes = 15 * 1024 * 1024;

        private readonly IImageService _service;
        private readonly ILogger<ImageController> _logger;

        public ImageController(IImageService service, ILogger<ImageController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<PagedResult<ImageMetadataDto>>> GetAll(
            [FromQuery] string? query,
            [FromQuery] bool onlyFavorites,
            [FromQuery] int page,
            [FromQuery] int pageSize,
            CancellationToken cancellationToken)
        {
            if (pageSize <= 0)
            {
                pageSize = 20;
            }

            var result = await _service.GetAllAsync(query, onlyFavorites, page, pageSize, cancellationToken);

            return Ok(result);
        }

        [HttpGet]
        [Route("[action]/{id:guid}")]
        public async Task<ActionResult<ImageMetadataDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.GetByIdAsync(id, cancellationToken);

            return result.HasValue ? Ok(result) : NotFound();
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("[action]/{id:guid}")]
        [ImmutableResponseCache(Duration = 31536000, Location = ResponseCacheLocation.Client)]
        public async Task<IActionResult> GetThumbnail(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.GetThumbnailAsync(id, cancellationToken);

            return result.HasValue
                ? File(result.Value.Bytes, result.Value.ContentType)
                : NotFound();
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("[action]/{id:guid}")]
        [ImmutableResponseCache(Duration = 31536000, Location = ResponseCacheLocation.Client)]
        public async Task<IActionResult> GetOriginal(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.GetOriginalAsync(id, cancellationToken);

            return result.HasValue
                ? File(result.Value.Bytes, result.Value.ContentType, result.Value.FileName)
                : NotFound();
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<TagDto[]>> GetAllTags(CancellationToken cancellationToken)
        {
            var result = await _service.GetAllTagsAsync(cancellationToken);

            return Ok(result);
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<string[]>> SuggestTags([FromQuery] string query, CancellationToken cancellationToken)
        {
            var result = await _service.SuggestTagsAsync(query, cancellationToken);

            return Ok(result);
        }

        [HttpPost]
        [Route("[action]")]
        [RequestSizeLimit(MaxUploadSizeBytes)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxUploadSizeBytes)]
        public async Task<ActionResult<UploadResultDto>> Upload(
            [FromForm] IFormFile file,
            [FromForm] string[] tags,
            [FromForm] IFormFile? thumbnail,
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

            var isVideo = file.ContentType?.StartsWith("video/", StringComparison.OrdinalIgnoreCase);

            if (isVideo.HasValue && isVideo.Value && (thumbnail is null || thumbnail.Length == 0))
            {
                return BadRequest("Video upload requires a poster thumbnail");
            }

            var result = await _service.UploadAsync(file, tags ?? [], thumbnail, cancellationToken);

            return Ok(result);
        }

        [HttpDelete]
        [Route("[action]/{id:guid}")]
        public async Task<ActionResult<bool>> Delete(Guid id, CancellationToken cancellationToken)
        {
            var result = await _service.DeleteAsync(id, cancellationToken);

            return result ? Ok(result) : NotFound();
        }

        [HttpPut]
        [Route("[action]/{id:guid}")]
        public async Task<ActionResult<ImageMetadataDto>> SetTags(
            Guid id,
            [FromBody] string[] tags,
            CancellationToken cancellationToken)
        {
            var result = await _service.SetTagsAsync(id, tags ?? [], cancellationToken);

            return result.HasValue ? Ok(result) : NotFound();
        }

        [HttpPut]
        [Route("[action]/{id:guid}")]
        public async Task<ActionResult<ImageMetadataDto>> SetFavorite(
            Guid id,
            [FromQuery] bool isFavorite,
            CancellationToken cancellationToken)
        {
            var result = await _service.SetFavoriteAsync(id, isFavorite, cancellationToken);

            return result.HasValue ? Ok(result) : NotFound();
        }
    }
}