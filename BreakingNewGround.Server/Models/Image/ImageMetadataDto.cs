using System;

namespace BreakingNewGround.Server.Models.Image
{
    public readonly record struct ImageMetadataDto(
        Guid Id,
        string OriginalFileName,
        string ContentType,
        bool IsFavorite,
        int Width,
        int Height,
        int SizeBytes,
        DateTime UploadedAtUtc,
        string[] Tags);
}