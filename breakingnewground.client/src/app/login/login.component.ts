import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false
})
export class LoginComponent {
  userName = '';
  password = '';
  error = '';
  returnUrl = '/';

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  submit() {
    this.auth.login(this.userName, this.password).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: () => this.error = 'Неверные имя пользователя или пароль'
    });
  }
}
