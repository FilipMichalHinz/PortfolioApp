// =============================
// File: login.component.ts
// Description:
// Implements a standalone login component for user authentication.
// Accepts username and password, validates input, and authenticates via AuthService.
// Stores token on success and redirects to dashboard; displays alerts on failure.
// =============================

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // Enables [(ngModel)] and *ngIf, etc.
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Bound to input fields in the form
  username: string = '';
  password: string = '';

  // Controls display of login error message in UI
  loginFailed: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  /*
  Called when the user clicks the login button.
  Validates inputs, then calls the AuthService to authenticate.
  On success, stores auth token and redirects to dashboard.
  On error, sets loginFailed and shows appropriate alert.
  */
  login(): void {
    // Simple front-end validation
    if (!this.username.trim() || !this.password.trim()) {
      alert('Please insert username and password.');
      this.loginFailed = true;
      return;
    }

    // Call authentication API
    this.auth.authenticate(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login response:', response);

        // Success: store token and redirect
        if (response?.authHeader) {
          localStorage.setItem('headerValue', response.authHeader);
          this.loginFailed = false;
          this.router.navigate(['/dashboard']);
        } else {
          // Unexpected response format
          this.loginFailed = true;
          alert('Login failed. Invalid authentication.');
        }
      },
      error: (err) => {
        this.loginFailed = true;

        // Display context-specific error messages
        if (err.status === 401) {
          alert('Login failed.');
        } else if (err.status === 0) {
          alert('Connection to the server failed.');
        } else {
          alert('An error has occurred: ' + (err.error?.message || err.message));
        }

        console.error('Logon error:', err);
      }
    });
  }
}
