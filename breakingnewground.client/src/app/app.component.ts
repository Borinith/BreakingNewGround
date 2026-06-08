import { ChangeDetectionStrategy, Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'breakingnewground.client';
  private slideThreshold = 5 * 60 * 1000;

  constructor(
    public auth: AuthService,
    private router: Router) {

    this.router.events
      .pipe(
        filter(evt => evt instanceof NavigationEnd),
        switchMap(() => {
          const timeLeft = this.auth.getTokenExpiryDelay();

          if (timeLeft > 0 && timeLeft < this.slideThreshold) {
            return this.auth.updateAccessToken();
          }

          return EMPTY;
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  logout() {
    this.auth.logout('/');
  }
}
