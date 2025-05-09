import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioItem } from '../model/portfolio-item';
import { PortfolioItemService } from '../services/portfolio-item.service';
import { YahooFinanceService } from '../services/yahoo-finance.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-portfolio-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  
  templateUrl: './portfolio-item-form.component.html',
  styleUrls: ['./portfolio-item-form.component.css']
})

export class PortfolioItemFormComponent implements OnInit {
  // Input: ID of the portfolio the item belongs to
  @Input() portfolioId!: number;

  // Input: existing item data for editing (optional)
  @Input() itemToEdit: PortfolioItem | null = null;

  // Input: whether the form is in edit mode or create mode
  @Input() editMode: boolean = false;

  // Output: emit newly created item to parent
  @Output() created = new EventEmitter<PortfolioItem>();

  // Output: notify parent when form is cancelled
  @Output() cancel = new EventEmitter<void>();

  // Output: emit updated item to parent after edit
  @Output() updated = new EventEmitter<PortfolioItem>();

  // Local model for the form inputs
  item: PortfolioItem = {
    id: 0,
    portfolioId: 0,
    name: '',
    ticker: '',
    purchasePrice: 0,
    quantity: 0,
    purchaseDate: ''
  };

  constructor(
    private portfolioItemService: PortfolioItemService,
    private yahooService: YahooFinanceService
  ) {}

  ngOnInit(): void {
    // Pre-fill the form if in edit mode
    if (this.editMode && this.itemToEdit) {
      this.item = {
        ...this.itemToEdit,
        portfolioId: this.portfolioId // ensure correct association
      };
    } else {
      // Set defaults for a new item
      this.item = {
        id: 0,
        portfolioId: this.portfolioId,
        name: '',
        ticker: '',
        purchasePrice: 0,
        quantity: 0,
        purchaseDate: ''
      };
    }
  }

  // Called when the user finishes entering a ticker symbol
  onTickerEntered(): void {
    const ticker = this.item.ticker;

    if (!ticker) {
      // Clear name if ticker was removed
      this.item.name = '';
      return;
    }

    // Use YahooFinanceService to fetch the asset name for the ticker
    this.yahooService.getTickerInfo(ticker).subscribe({
      next: (data) => {
        this.item.name = data.name;
      },
      error: (err) => {
        console.error('Failed to fetch ticker info', err);
        this.item.name = 'Unknown';
      }
    });
  }

  // Normalizes ticker input as the user types
  onTickerChange(value: string): void {
    this.item.ticker = value.toUpperCase().trim();
  }

  // Called when form is submitted (create or update)
  create(): void {
    // Basic form validation
    if (!this.item.ticker || !this.item.name || 
        this.item.purchasePrice <= 0 || this.item.quantity <= 0 || !this.item.purchaseDate) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    if (this.editMode) {
      // Update existing item
      this.portfolioItemService.update(this.item).subscribe({
        next: (updatedItem: PortfolioItem) => {
          this.updated.emit(updatedItem); // notify parent
          this.resetForm();
        },
        error: (err: any) => {
          console.error('Failed to update item', err);
          alert('Failed to update item.');
        }
      });
      return;
    }

    // Create new item
    this.portfolioItemService.create(this.item).subscribe({
      next: (createdItem: PortfolioItem) => {
        this.created.emit(createdItem); // notify parent
        this.resetForm();
      },
      error: err => console.error('Failed to create portfolio item', err)
    });
  }

  // Triggered when cancel is clicked
  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }

  // Resets the internal form model
  private resetForm(): void {
    this.item = {
      id: 0,
      portfolioId: this.portfolioId,
      name: '',
      ticker: '',
      purchasePrice: 0,
      quantity: 0,
      purchaseDate: ''
    };
  }
}
