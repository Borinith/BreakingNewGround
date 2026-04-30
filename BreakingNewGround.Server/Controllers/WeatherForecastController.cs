using BreakingNewGround.Server.Models.Weather;
using BreakingNewGround.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
        public Task<WeatherForecast> GetWeatherForecast([FromQuery] string? city, [FromQuery] bool forceRefresh, CancellationToken cancellationToken)
        {
            return _service.GetWeatherForecastAsync(city, forceRefresh, cancellationToken);
        }

        [HttpGet]
        [Route("[action]")]
        public IActionResult GetCities()
        {
            return Ok(_service.GetCities());
        }
    }
}