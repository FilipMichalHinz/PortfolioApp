// =============================
// File: portfolio-detail.component.ts
// Description:
// Displays detailed information for a specific investment portfolio.
// Loads portfolio metadata and summary data (positions, profit/loss).
// Enables inline editing, item selling, and real-time performance calculation.
// Integrates chart visualization and Material table components.
// =============================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { PortfolioService } from '../services/portfolio.service';
import { PortfolioItemService } from '../services/portfolio-item.service';
import { YahooFinanceService } from '../services/yahoo-finance.service';

import { Portfolio } from '../model/portfolio';
import { PortfolioItem } from '../model/portfolio-item';
import { AssetPerformance, PortfolioSummary } from '../model/portfolio-summary';

import { PortfolioItemFormComponent } from '../portfolio-item-form/portfolio-item-form.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgxChartsModule,
    PortfolioItemFormComponent,
    SharedModule
  ],
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PortfolioDetailComponent implements OnInit {

  // Selected portfolio object
  portfolio!: Portfolio;

  // Aggregated summary data for the portfolio (positions, metrics)
  summary: PortfolioSummary = {
    portfolioId: 0,
    byAsset: [],
    initialInvestment: 0,
    currentValue: 0,
    totalProfitLoss: 0,
    changePercent: 0
  };

  // UI state flags
  isLoading = true;
  showForm = false;
  openPositionsExpanded = true;
  completedTradesExpanded = true;
  sellMode = false;

  // Portfolio performance breakdown
  totalFinalizedProfit = 0;
  totalFinalizedReturnPercent = 0;
  totalOpenProfit = 0;
  totalOpenReturnPercent = 0;

  // Item form editing state
  itemBeingEdited: PortfolioItem | null = null;
  isEditMode = false;

  // Inline editing state
  editingItemId: number | null = null;
  tempEditValues: any = {};

  // Exit price editing state
  editingSellPriceId: number | null = null;
  tempExitPrice: number | null = null;
  editSellMode = false;
  itemToEditSell!: PortfolioItem;

  // Modal state for selling an item
  itemToSell!: PortfolioItem;

  // Allocation chart data
  allocationPieData: { name: string, value: number }[] = [];
  colorScheme = 'cool';

  // Material table data sources
  openPositions = new MatTableDataSource<any>([]);
  completedPositions = new MatTableDataSource<any>([]);

  // Displayed columns in open and completed positions
  openPositionsColumns: string[] = ['ticker', 'name', 'quantity', 'purchasePrice', 'currentPrice', 'currentValue', 'profitLoss', 'returnPercent', 'actions'];
  completedPositionsColumns: string[] = ['ticker', 'name', 'quantity', 'purchasePrice', 'sellPrice', 'soldDate', 'profitLoss', 'returnPercent', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private portfolioSvc: PortfolioService,       // Service for portfolio data
    private itemSvc: PortfolioItemService,        // Service for item operations
    private yahooService: YahooFinanceService,    // Service for asset name lookup
    private router: Router                        // Router for redirection
  ) {}

  ngOnInit(): void {
    // Redirect to login page if no token exists
    const token = localStorage.getItem('headerValue');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Get portfolio ID from route params and load data
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) return;

      this.showForm = false;
      this.isLoading = true;

      // Load portfolio metadata
      this.portfolioSvc.getPortfolio(id).subscribe({
        next: p => {
          this.portfolio = p;
          this.checkLoadingFinished();
        },
        error: err => {
          console.error('Error loading portfolio', err);
          this.isLoading = false;
          alert('Error loading portfolio. Please try again later.');
        }
      });

      // Load asset summary data
      this.itemSvc.getSummary(id).subscribe({
        next: sum => {
          this.applySummary(id, sum);
          this.checkLoadingFinished();
        },
        error: err => {
          console.error('Error loading summary', err);
          this.isLoading = false;
          alert('Error loading summary. Please try again later.');
        }
      });
    });
  }

  // Assign summary data and update views
  private applySummary(id: number, sum: PortfolioSummary | null): void {
    this.summary = sum ?? {
      portfolioId: id,
      byAsset: [],
      initialInvestment: 0,
      currentValue: 0,
      totalProfitLoss: 0,
      changePercent: 0
    };
    this.fetchNames();        // Enrich assets with names
    this.updateTableData();   // Split assets into open/sold
  }

  // Populate Material tables with open/sold positions
  private updateTableData(): void {
    this.openPositions.data = this.summary.byAsset.filter(a => !a.isSold);
    this.completedPositions.data = this.summary.byAsset.filter(a => a.isSold);
  }

  // Check if loading is complete (both portfolio and summary loaded)
  private checkLoadingFinished(): void {
    this.isLoading = !(this.portfolio && this.summary);
  }

  // Reload summary data from backend
  private loadSummary(id: number): void {
    this.isLoading = true;
    this.itemSvc.getSummary(id).subscribe({
      next: sum => this.applySummary(id, sum),
      error: err => {
        console.error('Error loading summary', err);
        this.isLoading = false;
        alert('Error loading summary. Please try again later.');
      }
    });
  }

  // Fetch asset names based on ticker symbols
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
              this.finalizeSummaryDisplay();
            }
          },
          error: err => {
            console.error(`Failed to fetch ${asset.ticker}`, err);
            asset.name = 'Unknown';
            if (++loaded === this.summary.byAsset.length) {
              this.finalizeSummaryDisplay();
            }
          }
        });
      } else {
        if (++loaded === this.summary.byAsset.length) {
          this.finalizeSummaryDisplay();
        }
      }
    }
  }

  // Called after all asset names are fetched
  private finalizeSummaryDisplay(): void {
    this.calculateProfitMetrics();
    this.prepareAllocationPie();
    this.isLoading = false;
  }

  // Calculate P&L metrics for open and finalized positions
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

  // Create pie chart input from current holdings
  private prepareAllocationPie(): void {
    const openAssets = this.summary.byAsset.filter(a => !a.isSold);
    const grouped: { [key: string]: number } = {};

    for (const asset of openAssets) {
      const label = asset.ticker || 'Unknown';
      grouped[label] = (grouped[label] || 0) + asset.currentValue;
    }

    this.allocationPieData = Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }

  // Handle callback after new item is created
  onItemCreated(item: PortfolioItem): void {
    this.showForm = false;
    this.loadSummary(this.portfolio.id);
  }

  // Handle callback when form is cancelled
  onCancel(): void {
    this.showForm = false;
  }

  // Prepare inline editing state for a given asset
  editAsset(asset: any, isSellEdit: boolean = false): void {
    this.editingItemId = asset.id;

    this.tempEditValues = {
      ...asset,
      purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : new Date(),
      exitDate: asset.exitDate ? new Date(asset.exitDate) : null
    };

    if (isSellEdit) {
      this.tempEditValues.exitDate = this.tempEditValues.exitDate || new Date();
    }
  }

  // Cancel inline editing
  cancelEdit(): void {
    this.editingItemId = null;
    this.tempEditValues = {};
  }

  // Save changes from inline editing
  saveEdit(): void {
    if (!this.editingItemId || !this.tempEditValues) return;

    const asset = this.summary.byAsset.find(a => a.id === this.editingItemId);
    if (!asset) return;

    let updateObservable;
    let updateData: any = { id: this.editingItemId };

    if (asset.isSold) {
      if (this.tempEditValues.exitPrice == null || this.tempEditValues.exitDate == null) {
        alert('Please enter valid Exit Price and Exit Date!');
        return;
      }
      updateData.exitPrice = this.tempEditValues.exitPrice;
      updateData.exitDate = this.tempEditValues.exitDate;
      updateObservable = this.itemSvc.sellPortfolioItem(updateData);
    } else {
      const formattedPurchaseDate = this.tempEditValues.purchaseDate instanceof Date
        ? this.tempEditValues.purchaseDate.toISOString().split('T')[0]
        : this.tempEditValues.purchaseDate;

      updateData = {
        id: this.editingItemId,
        portfolioId: this.portfolio.id,
        name: this.tempEditValues.name,
        ticker: this.tempEditValues.ticker,
        quantity: this.tempEditValues.quantity,
        purchasePrice: this.tempEditValues.purchasePrice,
        purchaseDate: formattedPurchaseDate
      };
      updateObservable = this.itemSvc.update(updateData as PortfolioItem);
    }

    updateObservable.subscribe({
      next: () => {
        this.editingItemId = null;
        this.tempEditValues = {};
        this.loadSummary(this.portfolio.id);
      },
      error: err => alert('Error updating asset')
    });
  }

  // Getter for currently edited asset
  get currentEditingAsset(): AssetPerformance | undefined {
    return this.summary.byAsset.find(a => a.id === this.editingItemId);
  }

  // Confirm sale of item from modal
  confirmSell(): void {
    if (this.itemToSell.exitPrice == null || this.itemToSell.exitPrice <= 0) {
      alert('Please enter a valid Exit Price!');
      return;
    }
    if (!this.itemToSell.exitDate) {
      alert('Please enter an Exit Date!');
      return;
    }

    const req = {
      id: this.itemToSell.id,
      exitPrice: this.itemToSell.exitPrice,
      exitDate: this.itemToSell.exitDate
    };

    this.itemSvc.sellPortfolioItem(req).subscribe({
      next: () => {
        this.sellMode = false;
        this.loadSummary(this.portfolio.id);
      },
      error: err => {
        console.error('Error selling asset', err);
        alert('Error selling asset. Please check your input.');
      }
    });
  }

  // Cancel sell modal
  cancelSell(): void {
    this.sellMode = false;
  }

  // Start selling an item (opens modal)
  startSell(asset: any): void {
    this.sellMode = true;
    this.itemToSell = {
      id: asset.id,
      portfolioId: this.portfolio.id,
      ticker: asset.ticker,
      name: asset.name || 'Unknown',
      quantity: asset.quantity,
      purchasePrice: asset.purchasePrice,
      purchaseDate: asset.purchaseDate,
      exitPrice: 0,
      exitDate: new Date().toISOString().split('T')[0]
    };
  }

  // Delete an asset from the portfolio
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

  // Start editing an item using the embedded form
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

  // Callback after item was updated from form
  onItemUpdated(updatedItem: PortfolioItem): void {
    this.showForm = false;
    this.loadSummary(this.portfolio.id);
    this.isEditMode = false;
    this.itemBeingEdited = null;
  }

  // Start editing exit price in completed table
  editSell(asset: PortfolioItem): void {
    this.editSellMode = true;
    this.itemToEditSell = { ...asset };
  }

  // Start editing exit price inline
  startEditSellPrice(asset: any): void {
    this.editingSellPriceId = asset.id;
    this.tempExitPrice = asset.exitPrice;
  }

  // Cancel exit price inline editing
  cancelEditSellPrice(): void {
    this.editingSellPriceId = null;
    this.tempExitPrice = null;
  }

  // Save updated sell price
  saveEditSellPrice(): void {
    if (this.tempExitPrice == null || this.tempExitPrice <= 0) return;

    const req = {
      id: this.itemToEditSell.id,
      exitPrice: this.itemToEditSell.exitPrice!,
      exitDate: this.itemToEditSell.exitDate!
    };

    this.itemSvc.sellPortfolioItem(req).subscribe({
      next: () => {
        this.editingSellPriceId = null;
        this.tempExitPrice = null;
        this.loadSummary(this.portfolio.id);
      },
      error: err => alert('Failed to update sale')
    });
  }

  // Prevent saving if no asset is selected
  get isSaveDisabled(): boolean {
    return !this.currentEditingAsset;
  }
}
