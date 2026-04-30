import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WeatherForecast } from './weatherforecast.model';

@Injectable({
  providedIn: 'root'
})

export class WeatherForecastService {

  private readonly baseUrl = '/api/WeatherForecast';

  constructor(private http: HttpClient) { }

  getCities(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/GetCities`);
  }

  getForecast(city: string, forceRefresh = false): Observable<WeatherForecast> {
    let params = new HttpParams().set('city', city);

    if (forceRefresh) {
      params = params.set('forceRefresh', 'true');
    }

    return this.http.get<WeatherForecast>(`${this.baseUrl}/GetWeatherForecast`, { params });
  }
}
