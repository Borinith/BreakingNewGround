using System;

namespace BreakingNewGround.Server.Models.Weather
{
    public record struct DailyWeather(
        DateOnly Date,
        double TemperatureMin,
        double TemperatureMax,
        double PrecipitationSum,
        double WindSpeedMax,
        double UvIndexMax,
        double Pressure,
        DateTime Sunrise,
        DateTime Sunset);
}