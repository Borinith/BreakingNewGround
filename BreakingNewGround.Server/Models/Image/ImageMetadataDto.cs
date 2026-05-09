using System;

namespace BreakingNewGround.Server.Models.Image
{
    public readonly record struct ImageMetadataDto(
        Guid Id,
        string OriginalFileName,
        string ContentType,
        int Width,
        int Height,
        int SizeBytes,
        DateTime UploadedAt,
        string[] Tags);
}