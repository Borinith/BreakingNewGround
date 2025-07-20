import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs/operators';

interface LoginResponse { token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private expirationTimer: any;

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    this.scheduleExpiryLogout();
  }

  login(userName: string, password: string) {
    return this.http
      .post<LoginResponse>('/api/account/login', { userName, password })
      .pipe(tap(res => {
        localStorage.setItem('jwt', res.token);
        this.scheduleExpiryLogout();
      }));
  }

  register(userName: string, password: string) {
    return this.http.post<void>('/api/account/register', { userName, password });
  }

  logout() {
    localStorage.removeItem('jwt');
    clearTimeout(this.expirationTimer);
    window.location.href = '/login';
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

  private scheduleExpiryLogout() {
    clearTimeout(this.expirationTimer);

    const token = this.token;
    if (!token) {
      return;
    }

    const { exp } = this.jwtHelper.decodeToken(token);
    const expiresAtMs = exp * 1000;
    const delay = expiresAtMs - Date.now();

    if (delay <= 0) {
      this.logout();
    } else {
      this.expirationTimer = setTimeout(() => this.logout(), delay);
    }
  }
}
