import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const skipAuthUrls = [/\/api\/account\/login/, /\/api\/account\/register/];

    if (skipAuthUrls.some(re => re.test(req.url))) {
      return next.handle(req);
    }

    const token = this.auth.token;

    if (!token) {
      this.auth.logout();
      this.router.navigate(['/login']);
      return throwError(() => new Error('Not authenticated'));
    }

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  }
}
