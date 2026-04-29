using System;

namespace BreakingNewGround.Server.Models.Weather
{
    public record struct CurrentWeather(
        double Temperature,
        double WindSpeed,
        double Precipitation,
        double Pressure,
        DateTime Sunrise,
        DateTime Sunset);
}