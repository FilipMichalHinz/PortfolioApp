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

  constructor(private auth: AuthService, private router: Router) {}

  login(): void {
    if (!this.username.trim() || !this.password.trim()) {
      alert('Bitte gib Benutzername und Passwort ein.');
      this.loginFailed = true;
      return;
    }

    this.auth.authenticate(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login response:', response); // Debug-Hilfe

        if (response?.authHeader) {
          localStorage.setItem('headerValue', response.authHeader);
          this.loginFailed = false;
          this.router.navigate(['/dashboard']);
        } else {
          this.loginFailed = true;
          alert('Login failed. Invalid authentication.');
        }
      },
      error: (err) => {
        this.loginFailed = true;

        if (err.status === 401) {
          alert('Falscher Benutzername oder Passwort.');
        } else if (err.status === 0) {
          alert('Verbindung zum Server fehlgeschlagen.');
        } else {
          alert('Ein Fehler ist aufgetreten: ' + (err.error?.message || err.message));
        }

        console.error('Login-Fehler:', err);
      }
    });
  }
}
