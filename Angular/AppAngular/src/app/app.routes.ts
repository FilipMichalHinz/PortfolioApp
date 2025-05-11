import { Routes } from '@angular/router';
import { PortfolioListComponent } from './portfolio-list/portfolio-list.component';
import { PortfolioDetailComponent } from './portfolio-detail/portfolio-detail.component';
import { LoginComponent } from './login/login.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './auth.guard';

// Define the application's route configuration
export const routes: Routes = [
  // Route to show a list of all portfolios
  { path: 'portfolio-list', component: PortfolioListComponent, canActivate: [authGuard] },

  // Default route: redirect to dashboard if no specific path is provided
  {path: 'dashboard', component: DashboardComponent, canActivate: [authGuard]},

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Dynamic route: shows details for a specific portfolio by its ID
  { path: 'portfolio/:id', component: PortfolioDetailComponent, canActivate: [authGuard] },

  // Route for login screen
  { path: 'login', component: LoginComponent,  },

  { path: 'watchlist', component: WatchlistComponent, canActivate: [authGuard]}


];
