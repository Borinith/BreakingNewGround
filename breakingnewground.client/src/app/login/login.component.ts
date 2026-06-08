import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userName = '';
  password = '';
  error = '';
  private returnUrl = '/';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  submit() {
    this.error = '';
    this.isLoading = true;

    this.auth.login(this.userName, this.password).pipe(
      finalize(() => this.isLoading = false))
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl),
        error: () => this.error = 'Неверные имя пользователя или пароль'
      });
  }
}
