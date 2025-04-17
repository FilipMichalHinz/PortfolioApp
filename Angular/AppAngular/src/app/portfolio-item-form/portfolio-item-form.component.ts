import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioItem } from '../model/portfolio-item';
import { PortfolioItemService } from '../services/portfolio-item.service';
import { AssetTypeService } from '../services/asset-type.service';
import { AssetType } from '../model/asset-type';

@Component({
  selector: 'app-portfolio-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio-item-form.component.html',
  styleUrls: ['./portfolio-item-form.component.css']
})
export class PortfolioItemFormComponent implements OnInit {
  @Input() portfolioId!: number; // required to associate item with portfolio
  @Output() created = new EventEmitter<PortfolioItem>(); // emit after creation
  @Output() cancel = new EventEmitter<void>(); // emit when portfolio cancels

  assetTypes: AssetType[] = [];

  item: PortfolioItem = {
    id: 0,
    portfolioId: 0,
    assetTypeId: 0,
    name: '',
    purchasePrice: 0,
    quantity: 0,
    purchaseDate: new Date()
  };

  constructor(
    private portfolioService: PortfolioItemService,
    private assetTypeService: AssetTypeService
  ) {}

  ngOnInit(): void {
    this.loadAssetTypes();
    this.item.portfolioId = this.portfolioId;
  }

  // Fetches available asset types from API
  loadAssetTypes(): void {
    this.assetTypeService.getAssetTypes().subscribe({
      next: types => this.assetTypes = types,
      error: err => console.error('Failed to load asset types', err)
    });
  }

  // Called when the form is submitted
  create(): void {
    if (!this.item.name || this.item.assetTypeId === 0 || this.item.purchasePrice <= 0 || this.item.quantity <= 0) {
      alert('Please fill in all required fields correctly.');
      return;
    }

    this.portfolioService.createPortfolioItem(this.item).subscribe({
      next: createdItem => {
        this.created.emit(createdItem); // notify parent
        this.resetForm();
      },
      error: err => console.error('Failed to create portfolio item', err)
    });
  }

  // Called when the cancel button is clicked
  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }

  // Clears the form for re-use
  private resetForm(): void {
    this.item = {
      id: 0,
      portfolioId: this.portfolioId,
      assetTypeId: 0,
      name: '',
      purchasePrice: 0,
      quantity: 0,
      purchaseDate: new Date()
    };
  }
}
