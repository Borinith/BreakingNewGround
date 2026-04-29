import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  summary: string;
}

@Component({
  selector: 'app-weatherforecast',
  templateUrl: './weatherforecast.component.html',
  standalone: false,
  styleUrls: ['./weatherforecast.component.css']
})
export class WeatherForecastComponent implements OnInit {

  public forecasts: WeatherForecast[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.getForecasts();
  }

  getForecasts() {
    this.http.get<WeatherForecast[]>('/api/WeatherForecast/GetWeatherForecast')
    .subscribe(
      (result) => {
        this.forecasts = result;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error(error);
      }
    );
  }

}
