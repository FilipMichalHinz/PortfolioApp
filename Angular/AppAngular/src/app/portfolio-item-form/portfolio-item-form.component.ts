import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioItem } from '../model/portfolio-item';
import { PortfolioItemService } from '../services/portfolio-item.service';

import { YahooFinanceService } from '../services/yahoo-finance.service'; // 🆕 Import YahooFinanceService

@Component({
  selector: 'app-portfolio-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio-item-form.component.html',
  styleUrls: ['./portfolio-item-form.component.css']
})
export class PortfolioItemFormComponent implements OnInit {
  @Input() portfolioId!: number; // required to associate item with portfolio
  @Input() itemToEdit: PortfolioItem | null = null;
  @Input() editMode: boolean = false; // true if editing an existing item
  @Output() created = new EventEmitter<PortfolioItem>(); // emit after creation
  @Output() cancel = new EventEmitter<void>(); // emit when cancel button clicked
  @Output() updated = new EventEmitter<PortfolioItem>(); // emit when item is updated

  s: [] = [];

  item: PortfolioItem = {
    id: 0,
    portfolioId: 0,
    //Id: 0,
    name: '',
    ticker: '',
    purchasePrice: 0,
    quantity: 0,
    purchaseDate: '' // e.g., '2024-04-26'
  };

  constructor(
    private portfolioItemService: PortfolioItemService,
    // private Service: Service,
    private yahooService: YahooFinanceService // 🆕 Inject YahooFinanceService
  ) {}

  ngOnInit(): void {
    if (this.editMode && this.itemToEdit) {
      this.item = {
        ...this.itemToEdit,
        portfolioId: this.portfolioId  // ✅ Ensures this is not lost
      };
    } else {
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

 

  // 🔹 Called when user finishes typing Ticker
  onTickerEntered(): void {
    const ticker = this.item.ticker;
  
    if (!ticker) {
      // 🧠 If user deleted the ticker, clear the name immediately
      this.item.name = '';
      return;
    }
  
    // 🧠 If ticker exists, fetch name normally
    this.yahooService.getTickerInfo(ticker).subscribe({
      next: (data) => {
        this.item.name = data.name;
      },
      error: (err) => {
        console.error('Failed to fetch ticker info', err);
        this.item.name = 'Unknown'; // fallback if error
      }
    });
  }
  

  // 🔹 Called when the form is submitted
  create(): void {
    if (!this.item.ticker || !this.item.name || 
        this.item.purchasePrice <= 0 || this.item.quantity <= 0 || !this.item.purchaseDate) {
      alert('Please fill in all required fields correctly.');
      return;
    }
  
    if (this.editMode) {
      // ✅ Send update to backend
      this.portfolioItemService.update(this.item).subscribe({
        next: (updatedItem: PortfolioItem) => {
          console.log('Updated:', updatedItem);
          this.updated.emit(updatedItem);  // 📤 Emit updated item to parent
          this.resetForm();
        },
        error: (err: any) => {
          console.error('Failed to update item', err);
          alert('Failed to update item.');
        }
      });
      return;
    }
  
    // ✅ Create if not in edit mode
    this.portfolioItemService.create(this.item).subscribe({
      next: (createdItem: PortfolioItem) => {
        this.created.emit(createdItem);
        this.resetForm();
      },
      error: err => console.error('Failed to create portfolio item', err)
    });
  }

  // 🔹 Called when the cancel button is clicked
  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }

  // 🔹 Clears the form for re-use
  private resetForm(): void {
    this.item = {
      id: 0,
      portfolioId: this.portfolioId,
      //Id: 0,
      name: '',
      ticker: '',
      purchasePrice: 0,
      quantity: 0,
      purchaseDate: ''
    };
  }
}
