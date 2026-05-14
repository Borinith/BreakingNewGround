using System;

namespace BreakingNewGround.Server.Models.Weather
{
    public readonly record struct CurrentWeather(
        int Temperature,
        int WindSpeed,
        int Precipitation,
        int Pressure,
        DateTime Sunrise,
        DateTime Sunset);
}