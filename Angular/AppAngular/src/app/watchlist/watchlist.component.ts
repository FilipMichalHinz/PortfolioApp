import { Component, OnInit }    from '@angular/core';
import { CommonModule }         from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule }          from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { WatchlistService, WatchlistItem } from '../services/watchlist.service';
import { YahooFinanceData, YahooFinanceService }              from '../services/yahoo-finance.service';

import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // check if required
    SharedModule,
    FormsModule       // ← for ngModel in our add form
  ],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {
  //table data
  // items: WatchlistItem[] = []; // old one 
  //using angular material table
  items = new MatTableDataSource<WatchlistItem>([]); // new one
  displayedColumns: string[] = ['ticker', 'assetName', 'targetPrice', 'currentPrice', 'actions'];

  isLoading = true;

  //editing variables
  editMode = false; 
  editingItem: WatchlistItem | null = null; // item being edited
  tempTargetPrice: number | null = null;

  // form fields
  newTicker = '';
  newTarget  = 0;

  showAddForm = false; // toggle for add item form

  constructor(
    private router: Router,
    private watchlistSvc: WatchlistService,
    private yahooSvc: YahooFinanceService,
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('headerValue') || '';
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
      this.loadWatchlist();

  }

  private loadWatchlist(): void {
    this.isLoading = true;
    this.watchlistSvc.getWatchlistItems().subscribe({
      next: rows => {
        this.items.data = rows; // assing data to mt table data source
        this.fetchLivePrices();
      },
      error: () => this.isLoading = false
    });
  }

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

  //make add item  form a toggle
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }
  
  addItem(): void {
    if (!this.newTicker.trim() || this.newTarget <= 0) return;

    this.watchlistSvc.getTickerInfo(this.newTicker.toUpperCase()).subscribe({
      next: (data: YahooFinanceData) => {
        const newItem: Partial<WatchlistItem> = {
          ticker:      this.newTicker.toUpperCase(),
          assetName:   data.name,               // will be filled by fetchLivePrices
          targetPrice: this.newTarget,
          currentPrice: null
    };

    this.watchlistSvc.add(newItem).subscribe({
      next: () => {
        this.newTicker = '';
        this.newTarget  = 0;
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
  
  deleteItem(id: number): void {
    if (!confirm('Delete this item?')) return;
    this.watchlistSvc.delete(id).subscribe({
      next: () => this.loadWatchlist(),
      error: err => console.error('Delete failed', err)
    });
  }
startEdit(item: WatchlistItem): void {
  this.editMode = true;
  this.editingItem = { ...item };          // Create a copy!
  this.tempTargetPrice = item.targetPrice; // Store the original value
}

cancelEdit(): void {
    this.editMode = false;
    this.editingItem = null;
    this.tempTargetPrice = null;      // Reset temp value
}

saveEdit(): void {
    if (!this.editingItem || this.editingItem.id === undefined || this.tempTargetPrice === null || this.tempTargetPrice <= 0) {
        alert('Invalid target price.');
        return;
    }

    this.watchlistSvc.update(this.editingItem.id, this.tempTargetPrice).subscribe({
        next: () => {
            this.loadWatchlist();    // Refresh the list
            this.cancelEdit();       // Exit edit mode
        },
        error: err => console.error('Update failed', err)
    });

}
}

