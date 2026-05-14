using System;

namespace BreakingNewGround.Server.Models.Image
{
    public readonly record struct UploadResultDto(Guid Id, bool WasDuplicate, string[] AddedTags);
}