const { env } = require('process');

const target = env["services__breakingnewground-server__https__0"] ?? 'https://localhost:7141';

const PROXY_CONFIG = [
  {
    context: [
      "/WeatherForecast",
      "/openapi",
      "/scalar",
    ],
    target,
    secure: false
  }
]

module.exports = PROXY_CONFIG;
