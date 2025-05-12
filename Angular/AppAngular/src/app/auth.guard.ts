// =============================
// File: auth.guard.ts
// Description:
// This file defines a route guard function (`authGuard`) for Angular's router.
// It checks whether the user is authenticated before allowing access to protected routes.
// If not authenticated, it redirects the user to the login page.
// The guard leverages Angular's dependency injection to access `AuthService` and `Router`.
// =============================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service'; 

// Define an authentication guard function to protect routes
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inject AuthService to check login state
  const router = inject(Router);           // Inject Router to handle redirection

  if (authService.isAuthenticated()) {
    return true; // User is authenticated – allow route activation
  } else {
    // User is not authenticated – redirect to the login page
    // Return a UrlTree that tells Angular Router to navigate to '/login'
    return router.createUrlTree(['/login']);
  }
};
