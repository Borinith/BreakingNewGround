import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userName = '';
  password = '';
  error = '';
  private returnUrl = '/';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  submit() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.auth.login(this.userName, this.password).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: () => this.error = 'Неверные имя пользователя или пароль'
    });

    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
