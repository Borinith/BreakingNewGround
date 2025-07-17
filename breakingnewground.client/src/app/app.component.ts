import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'breakingnewground.client';

  constructor(public auth: AuthService, private router: Router) { }

  ngOnInit() {
    setInterval(() => {
      if (!this.auth.isAuthenticated) {
        this.logout();
      }
    }, 60 * 1000);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
