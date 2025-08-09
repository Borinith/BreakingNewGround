namespace BreakingNewGround.Server.Models
{
    public record struct RequestOrder(
        string ColumnName,
        OrderByEnum OrderBy);
}