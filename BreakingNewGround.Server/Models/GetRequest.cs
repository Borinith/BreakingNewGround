namespace BreakingNewGround.Server.Models
{
    public readonly record struct GetRequest(
        RequestFilter[]? Filters = null,
        RequestOrder? Order = null,
        int? Skip = null,
        int? Take = null);
}