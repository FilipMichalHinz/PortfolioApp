// =============================
// File: portfolio-item-form.component.ts
// Description:
// This is the Angular component responsible for handling the form logic to create or edit
// a PortfolioItem (e.g. a stock or asset in a user’s investment portfolio).
// It supports both create and edit modes, handles user input, validation, form submission,
// integration with services for persistence (PortfolioItemService) and external data fetching
// (YahooFinanceService), and communicates with the parent component via events.
// =============================

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
  imports: [CommonModule, FormsModule, SharedModule], // Import Angular and shared modules
  templateUrl: './portfolio-item-form.component.html',
  styleUrls: ['./portfolio-item-form.component.css']
})
export class PortfolioItemFormComponent implements OnInit {

  // ID of the portfolio to which this item belongs
  @Input() portfolioId!: number;

  // Optional: existing item to populate the form in edit mode
  @Input() itemToEdit: PortfolioItem | null = null;

  // Boolean flag: true if the form is in edit mode
  @Input() editMode: boolean = false;

  // Emit when a new item is created
  @Output() created = new EventEmitter<PortfolioItem>();

  // Emit when form is cancelled
  @Output() cancel = new EventEmitter<void>();

  // Emit when an item is successfully updated
  @Output() updated = new EventEmitter<PortfolioItem>();


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
    private portfolioItemService: PortfolioItemService, // Service to create/update items
    private yahooService: YahooFinanceService           // Service to fetch asset info by ticker
  ) {}


  ngOnInit(): void {
    // If in edit mode, populate the form with the given item's data
    if (this.editMode && this.itemToEdit) {
      this.item = {
        ...this.itemToEdit,
        portfolioId: this.portfolioId // Ensure correct portfolio association
      };
    } else {
      // Set default values for creating a new item
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

  
  // When user finishes entering ticker, try to fetch the asset name
  onTickerEntered(): void {
    const ticker = this.item.ticker;

    if (!ticker) {
      this.item.name = ''; // Reset name if ticker is empty
      return;
    }

    // Fetch the company/asset name from Yahoo Finance
    this.yahooService.getTickerInfo(ticker).subscribe({
      next: (data) => {
        this.item.name = data.name; // Populate name field
      },
      error: (err) => {
        console.error('Failed to fetch ticker info', err);
        this.item.name = 'Unknown'; // Fallback value
      }
    });
  }


  // Normalize the ticker input (uppercase and trim whitespace)
  onTickerChange(value: string): void {
    this.item.ticker = value.toUpperCase().trim();
  }


  create(): void {
    // Basic validation checks
    if (!this.item.ticker || !this.item.name ||
        this.item.purchasePrice <= 0 || this.item.quantity <= 0 || !this.item.purchaseDate) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    // Branch based on create or edit mode
    if (this.editMode) {
      // Update existing item via service
      this.portfolioItemService.update(this.item).subscribe({
        next: (updatedItem: PortfolioItem) => {
          this.updated.emit(updatedItem); // Inform parent component
          this.resetForm();               // Reset internal form model
        },
        error: (err: any) => {
          console.error('Failed to update item', err);
          alert('Failed to update item.');
        }
      });
      return;
    }

    // Create new item via service
    this.portfolioItemService.create(this.item).subscribe({
      next: (createdItem: PortfolioItem) => {
        this.created.emit(createdItem); // Inform parent component
        this.resetForm();               // Clear form for new input
      },
      error: err => console.error('Failed to create portfolio item', err)
    });
  }

  
  onCancel(): void {
    this.cancel.emit(); // Inform parent
    this.resetForm();   // Clear internal model
  }

  // Resets form fields to defaults (used after create/cancel/update)
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
