namespace BreakingNewGround.Server.Models
{
    public readonly record struct RequestOrder(
        string ColumnName,
        OrderByEnum OrderBy,
        bool IsComplexSort,
        string? JoinTableName,
        string? JoinTableColumnName);
}