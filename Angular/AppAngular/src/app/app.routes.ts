import { Routes } from '@angular/router';
import { PortfolioListComponent } from './portfolio-list/portfolio-list.component';
import { PortfolioDetailComponent } from './portfolio-detail/portfolio-detail.component';
import { LoginComponent } from './login/login.component';


export const routes: Routes = [
  { path: 'portfolio-list', component: PortfolioListComponent },
  { path: '', redirectTo: 'portfolio-list', pathMatch: 'full' },
  //{ path: 'portfolio', component: PortfolioItemListComponent },
  { path: 'portfolio/:id', component: PortfolioDetailComponent },
  { path: "login", component: LoginComponent }
];
