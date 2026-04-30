export interface WeatherUnits {
  temperature: string;
  windSpeed: string;
  precipitation: string;
  pressure: string;
}

export interface CurrentWeather {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  pressure: number;
  sunrise: string;
  sunset: string;
}

export interface DailyWeather {
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  precipitationSum: number;
  windSpeedMax: number;
  uvIndexMax: number;
  pressure: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherForecast {
  city: string;
  lastUpdatedUtc: string;
  units: WeatherUnits;
  current: CurrentWeather;
  daily: DailyWeather[];
}
