import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: false,
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {
  userName = '';
  password = '';
  confirmPassword = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  submit() {
    this.error = '';

    if (this.password !== this.confirmPassword) {
      this.error = 'Пароли не совпадают';
      return;
    }

    this.auth.register(this.userName, this.password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        console.error('Ошибка регистрации', err);
        this.error = err.error?.[0]?.description
          || 'Не удалось зарегистрироваться';
      }
    });
  }
}
