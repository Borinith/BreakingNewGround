import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { interval, Subject, switchMap } from 'rxjs';
import { WeatherForecast } from './weatherforecast.model';
import { WeatherForecastService } from './weatherforecast.service';

@Component({
  selector: 'app-weatherforecast',
  templateUrl: './weatherforecast.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./weatherforecast.component.css']
})
export class WeatherForecastComponent implements OnInit {

  private static readonly POLL_INTERVAL_MS = 5 * 60 * 1000;

  cities: string[] = [];
  cityControl = new FormControl<string>('', { nonNullable: true });
  forecast: WeatherForecast | null = null;

  isLoading = false;
  errorMessage: string | null = null;

  private readonly fetch$ = new Subject<{ city: string; forceRefresh: boolean }>();

  constructor(
    private service: WeatherForecastService,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef) {
  }

  ngOnInit(): void {
    this.fetch$.pipe(
      switchMap(({ city, forceRefresh }) => {
        this.isLoading = true;
        this.errorMessage = null;
        this.cdr.detectChanges();
        return this.service.getForecast(city, forceRefresh);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: forecast => {
        this.forecast = forecast;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Weather forecast error', err);
        this.errorMessage = 'Не удалось загрузить прогноз погоды';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.cityControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(city => {
      if (city) {
        this.fetch$.next({ city, forceRefresh: false });
      }
    });

    interval(WeatherForecastComponent.POLL_INTERVAL_MS).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      const city = this.cityControl.value;
      if (city) {
        this.fetch$.next({ city, forceRefresh: false });
      }
    });

    this.service.getCities().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: cities => {
        this.cities = cities;
        if (cities.length > 0) {
          this.cityControl.setValue(cities[0]);
        }
      },
      error: err => {
        console.error('Get cities error', err);
        this.errorMessage = 'Не удалось загрузить список городов';
        this.cdr.detectChanges();
      }
    });
  }

  refresh(): void {
    const city = this.cityControl.value;
    if (city) {
      this.fetch$.next({ city, forceRefresh: true });
    }
  }
}
