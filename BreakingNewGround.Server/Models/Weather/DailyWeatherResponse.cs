using System.Text.Json.Serialization;

namespace BreakingNewGround.Server.Models.Weather
{
    public class DailyWeatherResponse
    {
        [JsonPropertyName("time")]
        public string[] Time { get; set; } = [];

        [JsonPropertyName("temperature_2m_max")]
        public double[] Temperature2mMax { get; set; } = [];

        [JsonPropertyName("temperature_2m_min")]
        public double[] Temperature2mMin { get; set; } = [];

        [JsonPropertyName("precipitation_sum")]
        public double[] PrecipitationSum { get; set; } = [];

        [JsonPropertyName("wind_speed_10m_max")]
        public double[] WindSpeed10mMax { get; set; } = [];

        [JsonPropertyName("uv_index_max")]
        public double[] UvIndexMax { get; set; } = [];

        [JsonPropertyName("sunrise")]
        public string[] Sunrise { get; set; } = [];

        [JsonPropertyName("sunset")]
        public string[] Sunset { get; set; } = [];
    }
}