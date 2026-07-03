import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EMPTY } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

interface LoginResponse { accessToken: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private expirationTimer: any;
  private updateInProgress = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {
    this.scheduleExpiryLogout(); // Comment this for registration
  }

  login(userName: string, password: string) {
    return this.http
      .post<LoginResponse>('/api/account/login',
        { userName, password },
        { withCredentials: true })
      .pipe(tap(res => {
        localStorage.setItem('jwt', res.accessToken);
        this.scheduleExpiryLogout();
      }));
  }

  register(userName: string, password: string) {
    return this.http.post<void>('/api/account/register', { userName, password });
  }

  logout(returnUrl: string = '') {
    returnUrl = returnUrl !== '' ? returnUrl : this.router.url;

    localStorage.removeItem('jwt');
    clearTimeout(this.expirationTimer);

    this.router.navigate(['/login'], {
      queryParams: { returnUrl },
      replaceUrl: true
    });
  }

  get token(): string | null {
    return localStorage.getItem('jwt');
  }

  private get isTokenExpired(): boolean {
    const token = this.token;
    return token ? this.jwtHelper.isTokenExpired(token) : true;
  }

  get isAuthenticated(): boolean {
    return !!this.token && !this.isTokenExpired;
  }

  getTokenExpiryDelay(): number {
    const token = this.token;
    if (!token) {
      return 0;
    }

    const { exp } = this.jwtHelper.decodeToken(token);
    const expiresAtMs = exp * 1000;

    return expiresAtMs - Date.now();
  }

  private scheduleExpiryLogout() {
    clearTimeout(this.expirationTimer);
    const delay = this.getTokenExpiryDelay();

    if (delay <= 0) {
      this.logout();
    } else {
      this.expirationTimer = setTimeout(() => this.logout(), delay);
    }
  }

  updateAccessToken() {
    if (this.updateInProgress) {
      return EMPTY;
    }

    this.updateInProgress = true;

    return this.http.post<LoginResponse>('/api/account/updateAccessToken', {})
      .pipe(
        tap(res => {
          if (res?.accessToken) {
            localStorage.setItem('jwt', res.accessToken);
          }
        }),
        finalize(() => this.updateInProgress = false));
  }
}
