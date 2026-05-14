namespace BreakingNewGround.Server.Models
{
    public readonly record struct RequestFilter(
        string ColumnName,
        ValueTypeEnum ValueType,
        string Value,
        ComparisonEnum Comparison);
}