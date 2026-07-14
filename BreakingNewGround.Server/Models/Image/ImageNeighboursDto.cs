using System;

namespace BreakingNewGround.Server.Models.Image
{
    public readonly record struct ImageNeighboursDto(Guid? PreviousImageId, Guid? NextImageId);
}