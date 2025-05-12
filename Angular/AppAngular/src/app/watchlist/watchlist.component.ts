// =============================
// File: watchlist.component.ts
// Description:
// Defines the WatchlistComponent for managing user watchlist entries.
// Handles listing, live price updates via YahooFinanceService, adding, editing, and deleting items.
// Integrates Angular Material table, reactive data binding, and a standalone component structure.
// =============================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { WatchlistService, WatchlistItem } from '../services/watchlist.service';
import { YahooFinanceData, YahooFinanceService } from '../services/yahoo-finance.service';

import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FormsModule
  ],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  // Table configuration
  items = new MatTableDataSource<WatchlistItem>([]);
  displayedColumns: string[] = ['ticker', 'assetName', 'targetPrice', 'currentPrice', 'actions'];
  isLoading = true;

  // Editing state
  editMode = false;
  editingItem: WatchlistItem | null = null;
  tempTargetPrice: number | null = null;

  // Add item form state
  newTicker = '';
  newTarget = 0;
  showAddForm = false;

  constructor(
    private router: Router,
    private watchlistSvc: WatchlistService,
    private yahooSvc: YahooFinanceService
  ) {}

  ngOnInit(): void {
    // Check for auth token on init; redirect to login if not found
    const token = localStorage.getItem('headerValue') || '';
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadWatchlist();
  }

  // Loads the current watchlist from backend and fetches live prices
  private loadWatchlist(): void {
    this.isLoading = true;
    this.watchlistSvc.getWatchlistItems().subscribe({
      next: rows => {
        this.items.data = rows;
        this.fetchLivePrices();
      },
      error: () => this.isLoading = false
    });
  }

  // Retrieves current prices for all tickers from external API
  private fetchLivePrices(): void {
    if (!this.items.data.length) {
      this.isLoading = false;
      return;
    }

    let done = 0;
    this.items.data.forEach(item => {
      this.yahooSvc.getTickerInfo(item.ticker).subscribe({
        next: data => item.currentPrice = data.price,
        error: () => item.currentPrice = null,
        complete: () => {
          if (++done === this.items.data.length) {
            this.isLoading = false;
          }
        }
      });
    });
  }

  // Toggles the visibility of the add item form
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  // Adds a new item to the watchlist
  addItem(): void {
    if (!this.newTicker.trim() || this.newTarget <= 0) return;

    this.watchlistSvc.getTickerInfo(this.newTicker.toUpperCase()).subscribe({
      next: (data: YahooFinanceData) => {
        const newItem: Partial<WatchlistItem> = {
          ticker: this.newTicker.toUpperCase(),
          assetName: data.name,
          targetPrice: this.newTarget,
          currentPrice: null
        };

        this.watchlistSvc.add(newItem).subscribe({
          next: () => {
            this.newTicker = '';
            this.newTarget = 0;
            this.loadWatchlist();
          },
          error: err => console.error('Add failed', err)
        });
      },
      error: err => {
        console.error('Ticker fetch failed', err);
        alert('Failed to fetch ticker data. Please check the ticker symbol.');
      }
    });
  }

  // Deletes an item from the watchlist after user confirmation
  deleteItem(id: number): void {
    if (!confirm('Delete this item?')) return;

    this.watchlistSvc.delete(id).subscribe({
      next: () => this.loadWatchlist(),
      error: err => console.error('Delete failed', err)
    });
  }

  // Enters edit mode for a specific item
  startEdit(item: WatchlistItem): void {
    this.editMode = true;
    this.editingItem = { ...item }; // Deep copy to avoid direct mutation
    this.tempTargetPrice = item.targetPrice;
  }

  // Cancels edit mode and resets temporary data
  cancelEdit(): void {
    this.editMode = false;
    this.editingItem = null;
    this.tempTargetPrice = null;
  }

  // Persists the edited target price to backend and reloads the list
  saveEdit(): void {
    if (
      !this.editingItem ||
      this.editingItem.id === undefined ||
      this.tempTargetPrice === null ||
      this.tempTargetPrice <= 0
    ) {
      alert('Invalid target price.');
      return;
    }

    this.watchlistSvc.update(this.editingItem.id, this.tempTargetPrice).subscribe({
      next: () => {
        this.loadWatchlist();
        this.cancelEdit();
      },
      error: err => console.error('Update failed', err)
    });
  }
}
