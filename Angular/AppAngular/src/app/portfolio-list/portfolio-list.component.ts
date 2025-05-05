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
  totalPortfolioCount = 0;
  totalPortfolioValue = 0;
  totalProfitLoss = 0;

  constructor(private portfolioService: PortfolioService, private router: Router) {}

  ngOnInit(): void {
    // Schutz: redirect to login, wenn nicht eingeloggt
    const token = localStorage.getItem('headerValue');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadOverviews();
  }

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

  onPortfolioDeleted(id: number): void {
    this.portfolios = this.portfolios.filter(p => p.id !== id);
  }

  onPortfolioCreated(created: Portfolio): void {
    this.loadOverviews();
  }
}
