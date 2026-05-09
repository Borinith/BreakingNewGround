namespace BreakingNewGround.Server.Models
{
    public readonly record struct PagedResult<T>(T[] Items, int Total);
}