// =============================
// File: app.component.ts
// Description:
// Defines the root component of the Angular application using the standalone component model.
// Handles global application behavior such as login state tracking, route monitoring, and logout functionality.
// Integrates routing and shared modules necessary for layout and navigation.
// =============================

import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,         // Enables <router-outlet> for component rendering based on routes
    RouterLink,           // Enables [routerLink] directive for navigation links
    RouterLinkActive,     // Enables [routerLinkActive] to highlight active links
    CommonModule,         // Provides common directives like *ngIf, *ngFor
    SharedModule          // Imports shared components, directives, or pipes
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'AppAngular';       // Application title (can be used in UI or browser title)
  isLoggedIn = false;         // Indicates whether a user is currently logged in
  isLoginPage = false;        // Indicates whether the current view is the login page

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Subscribe to navigation events to detect route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Check if a login token exists in local storage
        const token = localStorage.getItem('headerValue');
        this.isLoggedIn = !!token;

        // Determine whether the active route is the login page
        this.isLoginPage = this.router.url === '/login';
      });
  }

  logout(): void {
    // Remove authentication token from local storage
    localStorage.removeItem('headerValue');

    // Update application state to reflect logout
    this.isLoggedIn = false;

    // Redirect user to the login page
    this.router.navigate(['/login']);
  }
}
