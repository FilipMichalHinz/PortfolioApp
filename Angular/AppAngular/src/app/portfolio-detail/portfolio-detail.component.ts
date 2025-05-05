import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PortfolioService } from '../services/portfolio.service';
import { PortfolioItemService } from '../services/portfolio-item.service';
import { YahooFinanceService } from '../services/yahoo-finance.service';
import { Portfolio } from '../model/portfolio';
import { PortfolioItem } from '../model/portfolio-item';
import { PortfolioSummary } from '../model/portfolio-summary';
import { PortfolioItemFormComponent } from '../portfolio-item-form/portfolio-item-form.component';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxChartsModule,
    PortfolioItemFormComponent
  ],
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
  openPositionsExpanded = true;
  completedTradesExpanded = true;
  sellMode = false;

  totalFinalizedProfit = 0;
  totalFinalizedReturnPercent = 0;
  totalOpenProfit = 0;
  totalOpenReturnPercent = 0;

  itemBeingEdited: PortfolioItem | null = null;
  isEditMode: boolean = false;

  editSellMode = false;
  itemToEditSell!: PortfolioItem;

  allocationPieData: { name: string, value: number }[] = [];
  colorScheme = 'cool';

  itemToSell!: PortfolioItem;
  s: [] = [];

  constructor(
    private route: ActivatedRoute,
    private portfolioSvc: PortfolioService,
    private itemSvc: PortfolioItemService,
    private yahooService: YahooFinanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('headerValue');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) return;

      this.showForm = false;
      this.isLoading = true;

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
          this.applySummary(id, sum);
          this.checkLoadingFinished();
        },
        error: err => {
          console.error('Error loading summary', err);
          this.isLoading = false;
        }
      });
    });
  }

  private applySummary(id: number, sum: PortfolioSummary | null): void {
    this.summary = sum ?? {
      portfolioId: id,
      byAsset: [],
      initialInvestment: 0,
      currentValue: 0,
      totalProfitLoss: 0,
      changePercent: 0
    };
    this.fetchNames();
  }

  private checkLoadingFinished(): void {
    this.isLoading = !(this.portfolio && this.summary);
  }

  private loadSummary(id: number): void {
    this.isLoading = true;
    this.itemSvc.getSummary(id).subscribe({
      next: sum => this.applySummary(id, sum),
      error: err => {
        console.error('Error loading summary', err);
        this.isLoading = false;
      }
    });
  }

  private fetchNames(): void {
    if (!this.summary.byAsset?.length) {
      this.calculateProfitMetrics();
      this.prepareAllocationPie();
      this.isLoading = false;
      return;
    }

    let loaded = 0;

    for (const asset of this.summary.byAsset) {
      if (asset.ticker) {
        this.yahooService.getTickerInfo(asset.ticker).subscribe({
          next: data => {
            asset.name = data.name;
            if (++loaded === this.summary.byAsset.length) {
              this.calculateProfitMetrics();
              this.prepareAllocationPie();
              this.isLoading = false;
            }
          },
          error: err => {
            console.error(`Failed to fetch ${asset.ticker}`, err);
            asset.name = 'Unknown';
            if (++loaded === this.summary.byAsset.length) {
              this.calculateProfitMetrics();
              this.prepareAllocationPie();
              this.isLoading = false;
            }
          }
        });
      } else {
        if (++loaded === this.summary.byAsset.length) {
          this.calculateProfitMetrics();
          this.prepareAllocationPie();
          this.isLoading = false;
        }
      }
    }
  }

  private calculateProfitMetrics(): void {
    const openAssets = this.summary.byAsset.filter(a => !a.isSold);
    const finalizedAssets = this.summary.byAsset.filter(a => a.isSold);

    let openProfit = 0, openInvestment = 0, finalizedProfit = 0, finalizedInvestment = 0, openCurrentValue = 0;

    for (const a of openAssets) {
      const init = a.purchasePrice * a.quantity;
      const curr = a.currentPrice * a.quantity;
      openProfit += curr - init;
      openInvestment += init;
      openCurrentValue += curr;
    }

    for (const a of finalizedAssets) {
      const init = a.purchasePrice * a.quantity;
      const sold = (a.exitPrice ?? 0) * a.quantity;
      finalizedProfit += sold - init;
      finalizedInvestment += init;
    }

    this.totalOpenProfit = openProfit;
    this.totalOpenReturnPercent = openInvestment === 0 ? 0 : (openProfit / openInvestment) * 100;
    this.totalFinalizedProfit = finalizedProfit;
    this.totalFinalizedReturnPercent = finalizedInvestment === 0 ? 0 : (finalizedProfit / finalizedInvestment) * 100;

    this.summary.totalProfitLoss = openProfit + finalizedProfit;
    this.summary.changePercent = (openInvestment + finalizedInvestment) === 0
      ? 0 : ((openProfit + finalizedProfit) / (openInvestment + finalizedInvestment)) * 100;
    this.summary.initialInvestment = openInvestment;
    this.summary.currentValue = openCurrentValue;
  }

  private prepareAllocationPie(): void {
    const openAssets = this.summary.byAsset.filter(a => !a.isSold);
    const grouped: { [key: string]: number } = {};

    for (const asset of openAssets) {
      const label = asset.name || asset.ticker;
      if (!grouped[label]) {
        grouped[label] = 0;
      }
      grouped[label] += asset.currentValue;
    }

    this.allocationPieData = Object.entries(grouped).map(([name, value]) => ({
      name,
      value
    }));
  }

  onItemCreated(item: PortfolioItem): void {
    this.showForm = false;
    this.loadSummary(this.portfolio.id);
  }

  onCancel(): void {
    this.showForm = false;
  }

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
      error: err => {
        console.error('Error selling asset', err);
      }
    });
  }

  cancelSell(): void {
    this.sellMode = false;
  }

  deleteItem(id: number): void {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    this.itemSvc.delete(id).subscribe({
      next: () => this.loadSummary(this.portfolio.id),
      error: err => {
        console.error('Error deleting asset', err);
        alert('Failed to delete asset.');
      }
    });
  }

  startEdit(asset: any): void {
    this.itemBeingEdited = {
      id: asset.id,
      portfolioId: this.portfolio.id,
      ticker: asset.ticker,
      name: asset.name || 'Unknown',
      quantity: asset.quantity,
      purchasePrice: asset.purchasePrice,
      purchaseDate: asset.purchaseDate ?? new Date().toISOString().split('T')[0],
      exitPrice: asset.exitPrice,
      exitDate: asset.exitDate
    };
    this.isEditMode = true;
    this.showForm = true;
  }

  onItemUpdated(updatedItem: PortfolioItem): void {
    this.showForm = false;
    this.loadSummary(this.portfolio.id);
    this.isEditMode = false;
    this.itemBeingEdited = null;
  }

  editSell(asset: PortfolioItem): void {
    this.editSellMode = true;
    this.itemToEditSell = { ...asset };
  }

  confirmSellEdit(): void {
    const req = {
      id: this.itemToEditSell.id,
      exitPrice: this.itemToEditSell.exitPrice!,
      exitDate: this.itemToEditSell.exitDate!
    };

    this.itemSvc.sellPortfolioItem(req).subscribe({
      next: () => {
        this.editSellMode = false;
        this.loadSummary(this.portfolio.id);
      },
      error: err => alert('Failed to update sale')
    });
  }
}
