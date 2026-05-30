using BreakingNewGround.Server.Models.Weather;
using System.Collections.Immutable;
using System.Threading;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Services
{
    public interface IWeatherForecastService
    {
        ImmutableArray<string> GetCities();

        Task<WeatherForecast> GetWeatherForecastAsync(string? city, bool forceRefresh, CancellationToken cancellationToken);
    }
}