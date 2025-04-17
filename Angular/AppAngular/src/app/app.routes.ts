import { Routes } from '@angular/router';
import { PortfolioListComponent } from './portfolio-list/portfolio-list.component';
import { PortfolioItemListComponent } from './portfolio-item-list/portfolio-item-list.component';

export const routes: Routes = [
  { path: 'portfolio-list', component: PortfolioListComponent },
  { path: '', redirectTo: 'portfolio-list', pathMatch: 'full' },
  { path: 'portfolio', component: PortfolioItemListComponent }
];
