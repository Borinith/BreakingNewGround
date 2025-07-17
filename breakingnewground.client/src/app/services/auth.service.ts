import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { tap } from 'rxjs/operators';

interface LoginResponse { token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) { }

  login(userName: string, password: string) {
    return this.http
      .post<LoginResponse>('/api/account/login', { userName, password })
      .pipe(tap(res => localStorage.setItem('jwt', res.token)));
  }

  register(userName: string, password: string) {
    return this.http.post<void>('/api/account/register', { userName, password });
  }

  logout() {
    localStorage.removeItem('jwt');
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
}
