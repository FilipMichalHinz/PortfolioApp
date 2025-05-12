// =============================
// File: portfolio-list.component.ts
// Description:
// Displays a list of portfolio overviews for the authenticated user.
// Loads data from the backend and computes aggregate metrics (total value, profit/loss).
// Supports creating and deleting portfolios via child components.
// Utilizes Angular's standalone component structure and shared UI modules.
// =============================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { PortfolioService } from '../services/portfolio.service';
import { PortfolioOverview } from '../model/portfolio-overview';
import { Portfolio } from '../model/portfolio';

import { PortfolioCardComponent } from '../portfolio-card/portfolio-card.component';
import { PortfolioFormComponent } from '../portfolio-form/portfolio-form.component';

import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioCardComponent,    // Reusable component for displaying individual portfolios
    PortfolioFormComponent,    // Embedded form for creating new portfolios
    RouterModule,
    SharedModule
  ],
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.css']
})
export class PortfolioListComponent implements OnInit {
  portfolios: PortfolioOverview[] = [];  // Loaded portfolio summaries
  isLoading = false;                     // Tracks loading state during data fetch

  // Aggregated statistics across all portfolios
  totalPortfolioCount = 0;
  totalPortfolioValue = 0;
  totalProfitLoss = 0;

  showAddPortfolioForm = false; // Controls visibility of the "Add Portfolio" form

  constructor(
    private portfolioService: PortfolioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect to login page if no auth token found
    const token = localStorage.getItem('headerValue');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOverviews(); // Fetch portfolio summaries
  }

  // Fetches all portfolio overviews and calculates summary values
  loadOverviews(): void {
    this.isLoading = true;

    this.portfolioService.getAllOverviews().subscribe({
      next: (list) => {
        this.portfolios = list;

        this.totalPortfolioCount = list.length;
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

  // Removes a portfolio from the local list (used after deletion)
  onPortfolioDeleted(id: number): void {
    this.portfolios = this.portfolios.filter(p => p.id !== id);
  }

  // Reloads all portfolios after a new one is added
  onPortfolioCreated(created: Portfolio): void {
    this.loadOverviews();
    this.showAddPortfolioForm = false;
  }

  // Opens the "Add Portfolio" form
  openAddPortfolioForm(): void {
    this.showAddPortfolioForm = true;
  }

  // Closes the "Add Portfolio" form
  onAddPortfolioFormCancelled(): void {
    this.showAddPortfolioForm = false;
  }
}
