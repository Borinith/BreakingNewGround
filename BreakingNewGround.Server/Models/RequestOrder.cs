namespace BreakingNewGround.Server.Models
{
    public record struct RequestOrder(
        string ColumnName,
        OrderByEnum OrderBy,
        bool IsComplexSort,
        string? JoinTableName,
        string? JoinTableColumnName);
}