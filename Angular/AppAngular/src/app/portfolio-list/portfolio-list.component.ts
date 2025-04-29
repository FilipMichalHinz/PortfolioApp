

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // for ngIf and ngFor
import { Router, RouterModule } from '@angular/router'; // for routerLink

import { PortfolioService } from '../services/portfolio.service';
import { PortfolioOverview } from '../model/portfolio-overview';
import { Portfolio } from '../model/portfolio';

import { PortfolioCardComponent } from '../portfolio-card/portfolio-card.component';
import { PortfolioFormComponent } from '../portfolio-form/portfolio-form.component';

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  imports: [
    CommonModule,           
    PortfolioCardComponent, 
    PortfolioFormComponent,
    RouterModule  
  ],
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.css']
})
export class PortfolioListComponent implements OnInit {
  portfolios: PortfolioOverview[] = [];
  isLoading = false;

  constructor(private portfolioService: PortfolioService, private router: Router) {}

  ngOnInit(): void {
    if (this.portfolioService.authHeader == null) {
      this.router.navigate(["login"]);
      return;
    }
    this.loadOverviews();
  }

  loadOverviews(): void {
    this.isLoading = true;
    this.portfolioService.getAllOverviews().subscribe({
      next: (list) => {
        this.portfolios = list;
        this.isLoading = false;
        console.log('OVERVIEW DATA', list); // For debugging
      },
      error: (err) => {
        console.error('Failed to load portfolios', err);
        this.isLoading = false;
      }
    });
  }

  onPortfolioDeleted(id: number): void {
    // Remove from local list so the UI updates immediately
    this.portfolios = this.portfolios.filter(p => p.id !== id);
  }

  onPortfolioCreated(created: Portfolio): void {
    // After creating a new portfolio, reload the overviews
    this.loadOverviews();
  }
}

