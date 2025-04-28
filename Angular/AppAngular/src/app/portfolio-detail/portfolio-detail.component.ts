import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PortfolioItemService } from '../services/portfolio-item.service';
import { PortfolioService } from '../services/portfolio.service';
import { Portfolio } from '../model/portfolio';
import { PortfolioSummary } from '../model/portfolio-summary';
import { PortfolioItemFormComponent } from '../portfolio-item-form/portfolio-item-form.component';
import { PortfolioItem } from '../model/portfolio-item';
import { YahooFinanceService } from '../services/yahoo-finance.service';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts'; // 🧠 Import charts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PortfolioItemFormComponent, FormsModule, NgxChartsModule],
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
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

  // 🧠 Metrics
  totalFinalizedProfit: number = 0;
  totalFinalizedReturnPercent: number = 0;
  totalOpenProfit: number = 0;
  totalOpenReturnPercent: number = 0;

  // 🧠 Dropdowns
  openPositionsExpanded: boolean = true;
  completedTradesExpanded: boolean = true;

  // 🧠 Pie Chart
  allocationPieData: { name: string, value: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private itemSvc: PortfolioItemService,
    private portfolioSvc: PortfolioService,
    private yahooService: YahooFinanceService
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
        this.fetchNames(); // 🧠 Fetch names first
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
        this.fetchNames(); // 🔥 Fetch names immediately
      },
      error: err => {
        console.error('Error loading summary', err);
        this.isLoading = false;
      }
    });
  }

  /** 🔹 Calculate Open and Finalized Profit/Return */
  private calculateProfitMetrics(): void {
    const openAssets = this.summary.byAsset.filter(a => !a.isSold);
    const finalizedAssets = this.summary.byAsset.filter(a => a.isSold);

    let openProfit = 0;
    let openInvestment = 0;
    let finalizedProfit = 0;
    let finalizedInvestment = 0;
    let openCurrentValue = 0;

    for (const asset of openAssets) {
      const initial = asset.purchasePrice * asset.quantity;
      const current = asset.currentPrice * asset.quantity;
      const profit = current - initial;

      openProfit += profit;
      openInvestment += initial;
      openCurrentValue += current;
    }

    for (const asset of finalizedAssets) {
      const initial = asset.purchasePrice * asset.quantity;
      const sell = (asset.exitPrice ?? 0) * asset.quantity;
      const profit = sell - initial;

      finalizedProfit += profit;
      finalizedInvestment += initial;
    }

    this.totalOpenProfit = openProfit;
    this.totalOpenReturnPercent = openInvestment === 0 ? 0 : (openProfit / openInvestment) * 100;

    this.totalFinalizedProfit = finalizedProfit;
    this.totalFinalizedReturnPercent = finalizedInvestment === 0 ? 0 : (finalizedProfit / finalizedInvestment) * 100;

    // Update total P/L and Open Positions only
    this.summary.totalProfitLoss = openProfit + finalizedProfit;
    this.summary.changePercent = (openInvestment + finalizedInvestment) === 0
      ? 0
      : ((openProfit + finalizedProfit) / (openInvestment + finalizedInvestment)) * 100;

    this.summary.initialInvestment = openInvestment;
    this.summary.currentValue = openCurrentValue;
  }

  /** 🔹 Prepare data for Allocation Pie */
  private prepareAllocationPie(): void {
    const openAssets = this.summary.byAsset.filter(a => !a.isSold);

    this.allocationPieData = openAssets.map(asset => ({
      name: asset.ticker,
      value: asset.currentValue
    }));
  }
  // 🔹 Pie Chart colors
  colorScheme = {
    domain: ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC', '#0099C6', '#DD4477']
  };
  
  /** 🔹 Fetch Names from Yahoo */
  private fetchNames(): void {
    if (!this.summary.byAsset || this.summary.byAsset.length === 0) {
      console.warn('No assets to fetch names for.');
      this.calculateProfitMetrics();
      this.prepareAllocationPie();
      this.isLoading = false;
      return;
    }

    let loaded = 0;

    for (const asset of this.summary.byAsset) {
      if (asset.ticker) {
        this.yahooService.getTickerInfo(asset.ticker).subscribe({
          next: (data) => {
            asset.name = data.name;
            loaded++;
            if (loaded === this.summary.byAsset.length) {
              this.calculateProfitMetrics();
              this.prepareAllocationPie();
              this.isLoading = false;
            }
          },
          error: (err) => {
            console.error(`Failed to fetch name for ${asset.ticker}`, err);
            asset.name = 'Unknown';
            loaded++;
            if (loaded === this.summary.byAsset.length) {
              this.calculateProfitMetrics();
              this.prepareAllocationPie();
              this.isLoading = false;
            }
          }
        });
      } else {
        loaded++;
        if (loaded === this.summary.byAsset.length) {
          this.calculateProfitMetrics();
          this.prepareAllocationPie();
          this.isLoading = false;
        }
      }
    }
  }

  // 🔹 Sell form state
  sellMode: boolean = false;
  itemToSell!: PortfolioItem;

  startSell(asset: any): void {
    this.sellMode = true;
    this.itemToSell = {
      id: asset.id,
      ticker: asset.ticker,
      quantity: asset.quantity,
      purchasePrice: asset.purchasePrice,
      purchaseDate: asset.purchaseDate,
      exitPrice: 0,
      exitDate: new Date().toISOString().split('T')[0],
      portfolioId: this.portfolio.id,
      assetTypeId: asset.assetTypeId || 0,
      name: asset.name || 'Unknown'
    };
  }

  confirmSell(): void {
    if (this.itemToSell.exitPrice == null || this.itemToSell.exitPrice <= 0) {
      alert('Please enter a valid Exit Price!');
      return;
    }

    if (!this.itemToSell.exitDate) {
      alert('Please enter an Exit Date!');
      return;
    }

    const sellRequest = {
      id: this.itemToSell.id,
      exitPrice: this.itemToSell.exitPrice,
      exitDate: this.itemToSell.exitDate
    };

    this.itemSvc.sellPortfolioItem(sellRequest).subscribe({
      next: () => {
        this.sellMode = false;
        this.loadSummary(this.portfolio.id);
      },
      error: (err: any) => {
        console.error('Error selling asset', err);
      }
    });

    console.log('Confirm Sell button clicked', this.itemToSell);
  }

  cancelSell(): void {
    this.sellMode = false;
  }
}
