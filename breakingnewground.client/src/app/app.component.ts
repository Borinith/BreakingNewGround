import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'breakingnewground.client';
  private returnUrl = '/';
  private slideThreshold = 5 * 60 * 1000;

  constructor(
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.router.events
      .pipe(
        filter(evt => evt instanceof NavigationEnd),
        switchMap(() => {
          const timeLeft = this.auth.getTokenExpiryDelay();

          if (timeLeft > 0 && timeLeft < this.slideThreshold) {
            return this.auth.refreshToken();
          }

          return EMPTY;
        })
      )
      .subscribe();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl(this.returnUrl);
  }
}
