namespace BreakingNewGround.Server.Models
{
    public record struct RequestFilter(
        string ColumnName,
        string Value,
        ComparisonEnum Comparison);
}