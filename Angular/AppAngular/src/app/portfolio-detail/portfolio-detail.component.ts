import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PortfolioItemService } from '../services/portfolio-item.service';
import { PortfolioService } from '../services/portfolio.service';
import { Portfolio } from '../model/portfolio';
import { PortfolioSummary } from '../model/portfolio-summary';
import { PortfolioItemFormComponent } from '../portfolio-item-form/portfolio-item-form.component';
import { PortfolioItem } from '../model/portfolio-item';
import { YahooFinanceService } from '../services/yahoo-finance.service'; // 🆕 Add YahooFinanceService

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PortfolioItemFormComponent],
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.css']
})
export class PortfolioDetailComponent implements OnInit {
  portfolio!: Portfolio;
  summary: PortfolioSummary = {
    portfolioId: 0,
    byAsset: [],
    initialInvestment: 0,
    currentValue: 0,
    totalProfitLoss: 0,
    changePercent: 0
  };
  isLoading = true;
  showForm = false;

  constructor(
    private route: ActivatedRoute,
    private itemSvc: PortfolioItemService,
    private portfolioSvc: PortfolioService,
    private yahooService: YahooFinanceService // 🆕 Inject Yahoo Service
  ) {}

  ngOnInit(): void {
    this.showForm = false;
    this.isLoading = true;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.portfolioSvc.getPortfolio(id).subscribe({
      next: p => {
        this.portfolio = p;
        this.checkLoadingFinished();
      },
      error: err => {
        console.error('Error loading portfolio', err);
        this.isLoading = false;
      }
    });

    this.itemSvc.getSummary(id).subscribe({
      next: sum => {
        this.summary = sum ?? {
          portfolioId: id,
          byAsset: [],
          initialInvestment: 0,
          currentValue: 0,
          totalProfitLoss: 0,
          changePercent: 0
        };
        this.fetchNames(); // 🧠 After loading summary, fetch Names
        this.checkLoadingFinished();
      },
      error: err => {
        console.error('Error loading summary', err);
        this.isLoading = false;
      }
    });
  }

  private loadingParts = { portfolio: false, summary: false };

  private checkLoadingFinished(): void {
    if (this.portfolio) this.loadingParts.portfolio = true;
    if (this.summary) this.loadingParts.summary = true;
    this.isLoading = !(this.loadingParts.portfolio && this.loadingParts.summary);
  }

  onItemCreated(item: PortfolioItem): void {
    this.showForm = false;
    this.loadSummary(this.portfolio.id);
  }

  onCancel(): void {
    this.showForm = false;
  }

  private loadSummary(id: number): void {
    this.isLoading = true;
    this.itemSvc.getSummary(id).subscribe({
      next: sum => {
        this.summary = sum ?? {
          portfolioId: id,
          byAsset: [],
          initialInvestment: 0,
          currentValue: 0,
          totalProfitLoss: 0,
          changePercent: 0
        };
        this.fetchNames(); // 🧠 Fetch Names again after reloading summary
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading summary', err);
        this.isLoading = false;
      }
    });
  }

  /** 🔹 Fetch Name from Yahoo Finance for each asset ticker */
  private fetchNames(): void {
    if (!this.summary.byAsset || this.summary.byAsset.length === 0) {
      console.warn('No assets to fetch names for.');
      return;
    }

    for (const asset of this.summary.byAsset) {
      if (asset.ticker) {
        console.log('Fetching name for ticker:', asset.ticker); // 🧠 Debug log
        this.yahooService.getTickerInfo(asset.ticker).subscribe({
          next: (data) => {
            asset.name = data.name; // 🧠 Set the Name field
          },
          error: (err) => {
            console.error(`Failed to fetch name for ${asset.ticker}`, err);
            asset.name = 'Unknown'; // fallback if API fails
          }
        });
      } else {
        console.warn('Asset missing ticker:', asset);
      }
    }
  }
}
