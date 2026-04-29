using System.Text.Json.Serialization;

namespace BreakingNewGround.Server.Models.Weather
{
    public class OpenMeteoResponse
    {
        [JsonPropertyName("current")]
        public CurrentWeatherResponse Current { get; set; } = null!;

        [JsonPropertyName("current_units")]
        public CurrentUnitsResponse CurrentUnits { get; set; } = null!;

        [JsonPropertyName("hourly")]
        public HourlyWeatherResponse Hourly { get; set; } = null!;

        [JsonPropertyName("daily")]
        public DailyWeatherResponse Daily { get; set; } = null!;
    }
}