import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loginFailed: boolean = false;

  constructor(public auth: AuthService, private router: Router) {}

  login(): void {
    if (this.username && this.password) {
      this.auth.authenticate(this.username, this.password).subscribe({
        next: (response) => {
          if (response?.headerValue) {
            localStorage.setItem('headerValue', response.headerValue);
            this.loginFailed = false;
            this.router.navigate(['/portfolio-list']);
          } else {
            this.loginFailed = true;
          }
        },
        error: () => {
          this.loginFailed = true;
        }
      });
    }
  }
}
