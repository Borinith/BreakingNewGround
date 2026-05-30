using BreakingNewGround.Server.Models.Weather;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Frozen;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Services
{
    public class WeatherForecastService : IWeatherForecastService
    {
        private const string OpenMeteoUrlFormat =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude={0}&longitude={1}" +
            "&current=temperature_2m,wind_speed_10m,precipitation,pressure_msl" +
            "&hourly=pressure_msl" +
            "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset" +
            "&wind_speed_unit=ms" +
            "&forecast_days=7" +
            "&timezone=auto";

        private static readonly FrozenDictionary<string, string> UnitTranslations = new Dictionary<string, string>()
        {
            ["m/s"] = "м/с",
            ["hPa"] = "гПа",
            ["mm"] = "мм"
        }.ToFrozenDictionary();

        private readonly HybridCache _cache;
        private readonly HttpClient _httpClient;
        private readonly ILogger<WeatherForecastService> _logger;
        private readonly WeatherSettings _settings;

        public WeatherForecastService(
            HybridCache cache,
            HttpClient httpClient,
            ILogger<WeatherForecastService> logger,
            IOptions<WeatherSettings> settings)
        {
            _cache = cache;
            _httpClient = httpClient;
            _logger = logger;
            _settings = settings.Value;
        }

        public ImmutableArray<string> GetCities()
        {
            return _settings.Cities.Select(c => c.Name).ToImmutableArray();
        }

        public async Task<WeatherForecast> GetWeatherForecastAsync(string? cityName, bool forceRefresh, CancellationToken cancellationToken)
        {
            var city = GetCityByName(cityName);
            var cacheKey = $"weather_{city.Name}";

            if (forceRefresh)
            {
                await _cache.RemoveAsync(cacheKey, cancellationToken);
            }

            return await _cache.GetOrCreateAsync(
                cacheKey,
                city,
                GetDataAsync,
                new HybridCacheEntryOptions
                {
                    Expiration = TimeSpan.FromMinutes(_settings.CacheMinutes)
                },
                cancellationToken: cancellationToken);
        }

        private WeatherCity GetCityByName(string? city)
        {
            if (_settings.Cities.Length == 0)
            {
                throw new InvalidOperationException("No weather cities configured");
            }

            if (string.IsNullOrWhiteSpace(city))
            {
                return _settings.Cities[0];
            }

            var match = _settings.Cities.FirstOrDefault(c =>
                string.Equals(c.Name, city, StringComparison.OrdinalIgnoreCase));

            return match ?? _settings.Cities[0];
        }

        private async ValueTask<WeatherForecast> GetDataAsync(WeatherCity city, CancellationToken cancellationToken)
        {
            var url = string.Format(CultureInfo.InvariantCulture, OpenMeteoUrlFormat, city.Latitude, city.Longitude);

            var response = await _httpClient.GetFromJsonAsync<OpenMeteoResponse>(url, cancellationToken)
                ?? throw new InvalidOperationException("Open-Meteo returned no data");

            return Map(city.Name, response);
        }

        private static WeatherForecast Map(string cityName, OpenMeteoResponse r)
        {
            var dailyCount = r.Daily.Time.Length;
            var daily = new DailyWeather[dailyCount];

            for (int d = 0; d < dailyCount; d++)
            {
                int noonIdx = d * 24 + 12;
                var pressure = noonIdx < r.Hourly.PressureMsl.Length
                    ? r.Hourly.PressureMsl[noonIdx]
                    : 0;

                daily[d] = new DailyWeather(
                    DateOnly.Parse(r.Daily.Time[d], CultureInfo.InvariantCulture),
                    Round(r.Daily.Temperature2mMin[d]),
                    Round(r.Daily.Temperature2mMax[d]),
                    Round(r.Daily.PrecipitationSum[d]),
                    Round(r.Daily.WindSpeed10mMax[d]),
                    Round(r.Daily.UvIndexMax[d]),
                    Round(pressure),
                    DateTime.Parse(r.Daily.Sunrise[d], CultureInfo.InvariantCulture),
                    DateTime.Parse(r.Daily.Sunset[d], CultureInfo.InvariantCulture));
            }

            return new WeatherForecast(
                cityName,
                DateTime.UtcNow,
                new WeatherUnits(
                    Translate(r.CurrentUnits.Temperature2m),
                    Translate(r.CurrentUnits.WindSpeed10m),
                    Translate(r.CurrentUnits.Precipitation),
                    Translate(r.CurrentUnits.PressureMsl)),
                new CurrentWeather(
                    Round(r.Current.Temperature2m),
                    Round(r.Current.WindSpeed10m),
                    Round(r.Current.Precipitation),
                    Round(r.Current.PressureMsl),
                    daily.Length > 0 ? daily[0].Sunrise : default,
                    daily.Length > 0 ? daily[0].Sunset : default),
                daily);
        }

        private static int Round(double value)
        {
            return (int)Math.Round(value, MidpointRounding.AwayFromZero);
        }

        private static string Translate(string unit)
        {
            return UnitTranslations.TryGetValue(unit, out var translated) ? translated : unit;
        }
    }
}