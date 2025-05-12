// =============================
// File: app.config.ts
// Description:
// Defines the application's root configuration used during bootstrap.
// Sets up global Angular providers such as HTTP client, router with route definitions, 
// and asynchronous animations support for performance improvements.
// =============================

import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),           // Registers Angular's HttpClient for dependency injection
    provideRouter(routes),         // Registers the router and applies the defined routes
    provideAnimationsAsync()       // Enables animations with improved performance using async loading
  ]
};
