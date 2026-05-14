using BreakingNewGround.Server.Models;
using BreakingNewGround.Server.Models.Image;
using Microsoft.AspNetCore.Http;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Services
{
    public interface IImageService
    {
        Task<UploadResultDto> UploadAsync(IFormFile file, string[] tags, CancellationToken cancellationToken);

        Task<PagedResult<ImageMetadataDto>> GetAllAsync(string? query, bool onlyFavorites, int page, int pageSize, CancellationToken cancellationToken);

        Task<ImageMetadataDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<(byte[] Bytes, string ContentType)?> GetThumbnailAsync(Guid id, CancellationToken cancellationToken);

        Task<(byte[] Bytes, string ContentType, string FileName)?> GetOriginalAsync(Guid id, CancellationToken cancellationToken);

        Task<TagDto[]> GetAllTagsAsync(CancellationToken cancellationToken);

        Task<string[]> SuggestTagsAsync(string query, CancellationToken cancellationToken);

        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

        Task<ImageMetadataDto?> SetTagsAsync(Guid id, string[] tags, CancellationToken cancellationToken);

        Task<ImageMetadataDto?> SetFavoriteAsync(Guid id, bool isFavorite, CancellationToken cancellationToken);
    }
}