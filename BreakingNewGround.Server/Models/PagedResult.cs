namespace BreakingNewGround.Server.Models
{
    public record struct PagedResult<T>(T[] Items, int Total);
}