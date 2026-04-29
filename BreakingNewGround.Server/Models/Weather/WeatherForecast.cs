using System;

namespace BreakingNewGround.Server.Models.Weather
{
    public record struct WeatherForecast(
        string City,
        DateTime LastUpdatedUtc,
        WeatherUnits Units,
        CurrentWeather Current,
        DailyWeather[] Daily);
}