using System.Text.Json.Serialization;

namespace BreakingNewGround.Server.Models.Weather
{
    public class CurrentWeatherResponse
    {
        [JsonPropertyName("temperature_2m")]
        public double Temperature2m { get; set; }

        [JsonPropertyName("wind_speed_10m")]
        public double WindSpeed10m { get; set; }

        [JsonPropertyName("precipitation")]
        public double Precipitation { get; set; }

        [JsonPropertyName("pressure_msl")]
        public double PressureMsl { get; set; }
    }
}