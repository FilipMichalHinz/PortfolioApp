import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, // This component uses Angular's standalone component architecture
  imports: [FormsModule, CommonModule], // Import basic Angular modules needed for forms and structure
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';         // Bound to username input field
  password: string = '';         // Bound to password input field
  loginFailed: boolean = false;  // Flag to display login error message in the template

  constructor(public auth: AuthService, private router: Router) {}

  // Called when user submits login form
  login(): void {
    // Proceed only if both fields are filled
    if (this.username && this.password) {
      this.auth.authenticate(this.username, this.password).subscribe({
        next: (response) => {
          // Check if a headerValue (Basic Auth token) was returned
          if (response?.headerValue) {
            // Store the token in localStorage for use by authenticated routes/middleware
            localStorage.setItem('headerValue', response.headerValue);
            this.loginFailed = false;

            // Redirect to portfolio list on success
            this.router.navigate(['/portfolio-list']);
          } else {
            // Mark login as failed if no token was returned
            this.loginFailed = true;
          }
        },
        error: () => {
          // Handle HTTP or network error
          this.loginFailed = true;
        }
      });
    }
  }
}
