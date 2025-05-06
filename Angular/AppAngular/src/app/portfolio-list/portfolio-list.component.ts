import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
    PortfolioCardComponent,   // Used to display each portfolio as a card
    PortfolioFormComponent,   // Used to add a new portfolio
    RouterModule
  ],
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.css']
})
export class PortfolioListComponent implements OnInit {
  // List of portfolio overviews returned by the backend
  portfolios: PortfolioOverview[] = [];

  // Used to show loading state while fetching data
  isLoading = false;

  // Summary metrics for dashboard display
  totalPortfolioCount = 0;
  totalPortfolioValue = 0;
  totalProfitLoss = 0;

  constructor(
    private portfolioService: PortfolioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    // If not, redirect to login page
    const token = localStorage.getItem('headerValue');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Load portfolio summaries after login check
    this.loadOverviews();
  }

  // Loads portfolio overview data and calculates aggregates
  loadOverviews(): void {
    this.isLoading = true;

    this.portfolioService.getAllOverviews().subscribe({
      next: (list) => {
        this.portfolios = list;

        // Compute total number of portfolios
        this.totalPortfolioCount = list.length;

        // Compute total value and total profit/loss
        this.totalPortfolioValue = list.reduce((acc, p) => acc + p.currentValue, 0);
        this.totalProfitLoss = list.reduce((acc, p) => acc + p.totalProfitLoss, 0);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load portfolios', err);
        this.isLoading = false;
      }
    });
  }

  // Called when a portfolio is deleted from a child component
  onPortfolioDeleted(id: number): void {
    // Remove the portfolio from the local list
    this.portfolios = this.portfolios.filter(p => p.id !== id);
  }

  // Called when a new portfolio is created
  onPortfolioCreated(created: Portfolio): void {
    // Reload all overviews to include the new one
    this.loadOverviews();
  }
}
