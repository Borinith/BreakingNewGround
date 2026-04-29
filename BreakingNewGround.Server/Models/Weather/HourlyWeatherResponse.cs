using System.Text.Json.Serialization;

namespace BreakingNewGround.Server.Models.Weather
{
    public class HourlyWeatherResponse
    {
        [JsonPropertyName("time")]
        public string[] Time { get; set; } = [];

        [JsonPropertyName("pressure_msl")]
        public double[] PressureMsl { get; set; } = [];
    }
}