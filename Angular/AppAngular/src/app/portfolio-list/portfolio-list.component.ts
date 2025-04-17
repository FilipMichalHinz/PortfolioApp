import { Component, OnInit } from '@angular/core';
import { Portfolio } from '../model/portfolio';
import { PortfolioComponent } from '../portfolio/portfolio.component';
import { PortfolioService } from '../services/portfolio.service';
import { PortfolioFormComponent } from '../portfolio-form/portfolio-form.component';

@Component({
  selector: 'app-portfolio-list',
  standalone: true,
  imports: [PortfolioComponent, PortfolioFormComponent],
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.css']
})
export class PortfolioListComponent implements OnInit {
  portfolios: Portfolio[] = [];

  constructor(private portfolioService: PortfolioService) {}


  // Additional features:
  
  // Error handling for data loading

  isLoading = true;

  ngOnInit(): void {
    this.portfolioService.getPortfolios().subscribe({
      next: portfolios => {
        this.portfolios = portfolios;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error', err);
        this.isLoading = false;
      }
    });
  }

  // Removes the portfolio with the given ID from the local portfolios array
  // This ensures the UI updates immediately after deletion without reloading or re-fetching data
  onPortfolioDeleted(id: number): void {
    this.portfolios = this.portfolios.filter(u => u.id !== id);
  }

  onPortfolioCreated(portfolio: Portfolio): void {
    this.portfolioService.createPortfolio(portfolio).subscribe((createdPortfolio) => {
      this.portfolios.push(createdPortfolio);
    });
  }
}
