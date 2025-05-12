// =============================
// File: app.routes.ts
// Description:
// Defines the main route mappings for the Angular application.
// Each route links a URL path to a specific component.
// Routes that require authentication are protected using the `authGuard` function.
// =============================

import { Routes } from '@angular/router';
import { PortfolioListComponent } from './portfolio-list/portfolio-list.component';
import { PortfolioDetailComponent } from './portfolio-detail/portfolio-detail.component';
import { LoginComponent } from './login/login.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'portfolio-list',
    component: PortfolioListComponent,
    canActivate: [authGuard] // Access restricted to authenticated users
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard] // Access restricted to authenticated users
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full' // Redirect root URL to dashboard
  },
  {
    path: 'portfolio/:id',
    component: PortfolioDetailComponent,
    canActivate: [authGuard] // Access restricted; dynamic ID segment
  },
  {
    path: 'login',
    component: LoginComponent // Public route for user authentication
  },
  {
    path: 'watchlist',
    component: WatchlistComponent,
    canActivate: [authGuard] // Access restricted to authenticated users
  }
];
