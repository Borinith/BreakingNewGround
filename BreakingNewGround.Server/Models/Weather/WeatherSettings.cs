namespace BreakingNewGround.Server.Models.Weather
{
    public class WeatherSettings
    {
        public WeatherCity[] Cities { get; set; } = [];

        public int CacheMinutes { get; set; } = 15;
    }
}