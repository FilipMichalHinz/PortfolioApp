import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true, // This component uses Angular Standalone Component architecture
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, SharedModule], // Import required features for routing and templates
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'AppAngular'; // App title (can be shown in header or tab title)
  isLoggedIn = false;   // Tracks login status
  isLoginPage = false;  // Tracks whether current route is login page

  constructor(private router: Router) {}

  ngOnInit(): void {
    // React to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd)) // Only trigger on completed navigation
      .subscribe(() => {
        // Check for login token in local storage
        const token = localStorage.getItem('headerValue');
        this.isLoggedIn = !!token; // Set login status accordingly

        // Determine whether the current route is the login page
        this.isLoginPage = this.router.url === '/login';
      });
  }

  // Log out the user by removing token and redirecting to login page
  logout(): void {
    localStorage.removeItem('headerValue');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
