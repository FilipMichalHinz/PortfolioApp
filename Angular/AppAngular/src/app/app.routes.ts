import { Routes } from '@angular/router';
import { PortfolioListComponent } from './portfolio-list/portfolio-list.component';
import { PortfolioDetailComponent } from './portfolio-detail/portfolio-detail.component';
import { LoginComponent } from './login/login.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// Define the application's route configuration
export const routes: Routes = [
  // Route to show a list of all portfolios
  { path: 'portfolio-list', component: PortfolioListComponent },

  // Default route: redirect to dashboard if no specific path is provided
  {path: 'dashboard', component: DashboardComponent},
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Dynamic route: shows details for a specific portfolio by its ID
  { path: 'portfolio/:id', component: PortfolioDetailComponent },

  // Route for login screen
  { path: 'login', component: LoginComponent },

  { path: 'watchlist', component: WatchlistComponent}

  // NOTE: A route for PortfolioItemListComponent is commented out — 
  // uncomment it if you want to add a separate view for listing portfolio items
  // { path: 'portfolio', component: PortfolioItemListComponent },
];
