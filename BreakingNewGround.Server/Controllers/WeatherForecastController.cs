using BreakingNewGround.Server.Models.Weather;
using BreakingNewGround.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Immutable;
using System.Threading;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private readonly IWeatherForecastService _service;
        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(
            IWeatherForecastService service,
            ILogger<WeatherForecastController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<ActionResult<WeatherForecast>> GetWeatherForecast([FromQuery] string? city, [FromQuery] bool forceRefresh, CancellationToken cancellationToken)
        {
            var forecast = await _service.GetWeatherForecastAsync(city, forceRefresh, cancellationToken);

            return Ok(forecast);
        }

        [HttpGet]
        [Route("[action]")]
        public ActionResult<ImmutableArray<string>> GetCities()
        {
            return Ok(_service.GetCities());
        }
    }
}