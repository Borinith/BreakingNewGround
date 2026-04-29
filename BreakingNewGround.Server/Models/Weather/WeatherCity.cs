namespace BreakingNewGround.Server.Models.Weather
{
    public class WeatherCity
    {
        public required string Name { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }
}