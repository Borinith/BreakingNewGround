namespace BreakingNewGround.Server.Models.Weather
{
    public record struct WeatherUnits(
        string Temperature,
        string WindSpeed,
        string Precipitation,
        string Pressure);
}