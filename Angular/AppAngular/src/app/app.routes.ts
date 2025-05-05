import { Routes } from '@angular/router';
import { PortfolioListComponent } from './portfolio-list/portfolio-list.component';
import { PortfolioDetailComponent } from './portfolio-detail/portfolio-detail.component';
import { LoginComponent } from './login/login.component';

// Define the application's route configuration
export const routes: Routes = [
  // Route to show a list of all portfolios
  { path: 'portfolio-list', component: PortfolioListComponent },

  // Default route: redirect to portfolio list if no specific path is provided
  { path: '', redirectTo: 'portfolio-list', pathMatch: 'full' },

  // Dynamic route: shows details for a specific portfolio by its ID
  { path: 'portfolio/:id', component: PortfolioDetailComponent },

  // Route for login screen
  { path: 'login', component: LoginComponent }

  // NOTE: A route for PortfolioItemListComponent is commented out — 
  // uncomment it if you want to add a separate view for listing portfolio items
  // { path: 'portfolio', component: PortfolioItemListComponent },
];
