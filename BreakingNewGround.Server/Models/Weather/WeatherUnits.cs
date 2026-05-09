namespace BreakingNewGround.Server.Models.Weather
{
    public readonly record struct WeatherUnits(
        string Temperature,
        string WindSpeed,
        string Precipitation,
        string Pressure);
}