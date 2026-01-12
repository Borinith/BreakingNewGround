namespace BreakingNewGround.Server.Models
{
    public record struct RequestFilter(
        string ColumnName,
        ValueTypeEnum ValueType,
        string Value,
        ComparisonEnum Comparison);
}