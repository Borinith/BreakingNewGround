using System.Text.Json.Serialization;

namespace BreakingNewGround.Server.Models.Weather
{
    public class CurrentUnitsResponse
    {
        [JsonPropertyName("temperature_2m")]
        public string Temperature2m { get; set; } = string.Empty;

        [JsonPropertyName("wind_speed_10m")]
        public string WindSpeed10m { get; set; } = string.Empty;

        [JsonPropertyName("precipitation")]
        public string Precipitation { get; set; } = string.Empty;

        [JsonPropertyName("pressure_msl")]
        public string PressureMsl { get; set; } = string.Empty;
    }
}