using BreakingNewGround.Server.DAL.AzureSQL.Data;
using BreakingNewGround.Server.Models;
using BreakingNewGround.Server.Models.Image;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using ImageEntity = BreakingNewGround.Server.DAL.AzureSQL.Data.Image;

namespace BreakingNewGround.Server.Services
{
    public class ImageService : IImageService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ImageService> _logger;
        private readonly IImageProcessor _processor;

        public ImageService(AppDbContext context, ILogger<ImageService> logger, IImageProcessor processor)
        {
            _context = context;
            _logger = logger;
            _processor = processor;
        }

        public async Task<UploadResultDto> UploadAsync(IFormFile file, string[] tags, CancellationToken cancellationToken)
        {
            var bytes = await ReadAllBytesAsync(file, cancellationToken);
            var hash = SHA256.HashData(bytes);
            var normalizedTagNames = NormalizeTags(tags);

            var existing = await _context.Images
                .Include(i => i.Tags)
                .FirstOrDefaultAsync(i => i.Hash == hash, cancellationToken);

            if (existing is not null)
            {
                var addedTagNames = await MergeTagsAsync(existing, normalizedTagNames, cancellationToken);

                return new UploadResultDto(existing.Id, true, addedTagNames);
            }

            var processed = await _processor.ProcessAsync(bytes, cancellationToken);
            var resolvedTags = await ResolveTagsAsync(normalizedTagNames, cancellationToken);

            var image = new ImageEntity
            {
                OriginalFileName = file.FileName,
                ContentType = file.ContentType,
                IsFavorite = false,
                Width = processed.Width,
                Height = processed.Height,
                SizeBytes = bytes.Length,
                Original = bytes,
                Thumbnail = processed.Thumbnail,
                ThumbnailContentType = processed.ThumbnailContentType,
                Hash = hash,
                UploadedAt = DateTime.UtcNow,
                Tags = resolvedTags
            };

            _context.Images.Add(image);
            await _context.SaveChangesAsync(cancellationToken);

            return new UploadResultDto(image.Id, false, []);
        }

        public async Task<PagedResult<ImageMetadataDto>> GetAllAsync(string? query, int page, int pageSize, CancellationToken cancellationToken)
        {
            var images = _context.Images.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var normalized = query.Trim();
                images = images.Where(i => i.Tags.Any(t => t.Name.StartsWith(normalized)));
            }

            var total = await images.CountAsync(cancellationToken);

            var items = await images
                .OrderByDescending(i => i.UploadedAt)
                .Skip(page * pageSize)
                .Take(pageSize)
                .Select(i => new ImageMetadataDto(
                    i.Id,
                    i.OriginalFileName,
                    i.ContentType,
                    i.IsFavorite,
                    i.Width,
                    i.Height,
                    i.SizeBytes,
                    i.UploadedAt,
                    i.Tags.Select(t => t.Name).OrderBy(t => t).ToArray()))
                .ToArrayAsync(cancellationToken);

            return new PagedResult<ImageMetadataDto>(items, total);
        }

        public async Task<ImageMetadataDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Images
                .AsNoTracking()
                .Where(i => i.Id == id)
                .Select(i => new ImageMetadataDto(
                    i.Id,
                    i.OriginalFileName,
                    i.ContentType,
                    i.IsFavorite,
                    i.Width,
                    i.Height,
                    i.SizeBytes,
                    i.UploadedAt,
                    i.Tags.Select(t => t.Name).OrderBy(t => t).ToArray()))
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<(byte[] Bytes, string ContentType)?> GetThumbnailAsync(Guid id, CancellationToken cancellationToken)
        {
            var result = await _context.Images
                .AsNoTracking()
                .Where(i => i.Id == id)
                .Select(i => new { i.Thumbnail, i.ThumbnailContentType })
                .FirstOrDefaultAsync(cancellationToken);

            if (result is null)
            {
                return null;
            }

            return (result.Thumbnail, result.ThumbnailContentType);
        }

        public async Task<(byte[] Bytes, string ContentType, string FileName)?> GetOriginalAsync(Guid id, CancellationToken cancellationToken)
        {
            var result = await _context.Images
                .AsNoTracking()
                .Where(i => i.Id == id)
                .Select(i => new { i.Original, i.ContentType, i.OriginalFileName })
                .FirstOrDefaultAsync(cancellationToken);

            if (result is null)
            {
                return null;
            }

            return (result.Original, result.ContentType, result.OriginalFileName);
        }

        public async Task<TagDto[]> GetAllTagsAsync(CancellationToken cancellationToken)
        {
            return await _context.Tags
                .AsNoTracking()
                .OrderBy(t => t.Name)
                .Select(t => new TagDto(t.Id, t.Name, t.Images.Count))
                .ToArrayAsync(cancellationToken);
        }

        public async Task<string[]> SuggestTagsAsync(string query, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return [];
            }

            return await _context.Tags
                .AsNoTracking()
                .Where(t => t.Name.StartsWith(query.Trim()))
                .Select(t => t.Name)
                .OrderBy(t => t)
                .Take(10)
                .ToArrayAsync(cancellationToken);
        }

        public async Task<ImageMetadataDto?> SetTagsAsync(Guid id, string[] tags, CancellationToken cancellationToken)
        {
            var image = await _context.Images
                .Include(i => i.Tags)
                .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

            if (image is null)
            {
                return null;
            }

            var normalized = NormalizeTags(tags);

            var toRemove = image.Tags
                .ExceptBy(normalized, t => t.Name, StringComparer.InvariantCultureIgnoreCase)
                .ToList();

            foreach (var tag in toRemove)
            {
                image.Tags.Remove(tag);
            }

            await AddMissingTagsAsync(image, normalized, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return new ImageMetadataDto(
                image.Id,
                image.OriginalFileName,
                image.ContentType,
                image.IsFavorite,
                image.Width,
                image.Height,
                image.SizeBytes,
                image.UploadedAt,
                image.Tags.Select(t => t.Name).OrderBy(t => t).ToArray());
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
        {
            var image = await _context.Images
                .Include(i => i.Tags)
                .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

            if (image is null)
            {
                return false;
            }

            _context.Images.Remove(image);
            await _context.SaveChangesAsync(cancellationToken);

            /*var orphanTags = await _context.Tags
                .Where(t => !t.Images.Any())
                .ToListAsync(cancellationToken);

            if (orphanTags.Count > 0)
            {
                _context.Tags.RemoveRange(orphanTags);
                await _context.SaveChangesAsync(cancellationToken);
            }*/

            return true;
        }

        private static async Task<byte[]> ReadAllBytesAsync(IFormFile file, CancellationToken cancellationToken)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms, cancellationToken);

            return ms.ToArray();
        }

        private static string[] NormalizeTags(string[] tags)
        {
            return tags
                .Select(t => t?.Trim() ?? string.Empty)
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct(StringComparer.InvariantCultureIgnoreCase)
                .ToArray();
        }

        private async Task<List<Tag>> ResolveTagsAsync(string[] normalizedNames, CancellationToken cancellationToken)
        {
            if (normalizedNames.Length == 0)
            {
                return [];
            }

            var existingInDb = await _context.Tags
                .Where(t => normalizedNames.Contains(t.Name))
                .ToListAsync(cancellationToken);

            var newTags = normalizedNames
                .Except(existingInDb.Select(t => t.Name), StringComparer.InvariantCultureIgnoreCase)
                .Select(n => new Tag { Name = n })
                .ToList();

            if (newTags.Count > 0)
            {
                _context.Tags.AddRange(newTags);
                existingInDb.AddRange(newTags);
            }

            return existingInDb;
        }

        private async Task<string[]> AddMissingTagsAsync(ImageEntity image, string[] normalizedNames, CancellationToken cancellationToken)
        {
            var toAddNames = normalizedNames
                .Except(image.Tags.Select(t => t.Name), StringComparer.InvariantCultureIgnoreCase)
                .ToArray();

            if (toAddNames.Length == 0)
            {
                return [];
            }

            var resolved = await ResolveTagsAsync(toAddNames, cancellationToken);

            foreach (var tag in resolved)
            {
                image.Tags.Add(tag);
            }

            return toAddNames;
        }

        private async Task<string[]> MergeTagsAsync(ImageEntity image, string[] normalizedNames, CancellationToken cancellationToken)
        {
            var added = await AddMissingTagsAsync(image, normalizedNames, cancellationToken);

            if (added.Length > 0)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }

            return added;
        }
    }
}