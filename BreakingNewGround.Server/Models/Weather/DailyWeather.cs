using System;

namespace BreakingNewGround.Server.Models.Weather
{
    public record struct DailyWeather(
        DateOnly Date,
        int TemperatureMin,
        int TemperatureMax,
        int PrecipitationSum,
        int WindSpeedMax,
        int UvIndexMax,
        int Pressure,
        DateTime Sunrise,
        DateTime Sunset);
}