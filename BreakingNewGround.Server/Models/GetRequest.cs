namespace BreakingNewGround.Server.Models
{
    public record struct GetRequest(
        RequestFilter[]? Filters = null,
        RequestOrder? Order = null,
        int? Skip = 0,
        int? Take = 10);
}