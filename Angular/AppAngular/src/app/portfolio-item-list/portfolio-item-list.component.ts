import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioItem } from '../model/portfolio-item';
import { PortfolioItemService } from '../services/portfolio-item.service';
import { PortfolioItemFormComponent } from '../portfolio-item-form/portfolio-item-form.component';
import { AssetType } from '../model/asset-type';
import { AssetTypeService } from '../services/asset-type.service';
import { Portfolio } from '../model/portfolio';
import { PortfolioService } from '../services/portfolio.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-portfolio-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PortfolioItemFormComponent],
  templateUrl: './portfolio-item-list.component.html',
  styleUrls: ['./portfolio-item-list.component.css']
})
export class PortfolioItemListComponent implements OnInit {

  portfolioItems: PortfolioItem[] = [];
  assetTypes: AssetType[] = [];
  portfolios: Portfolio[] = [];
  selectedPortfolioId: number | null = null;

  isLoading = true;
  showForm = false;

  constructor(
    private portfolioItemService: PortfolioItemService,
    private assetTypeService: AssetTypeService,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit(): void {
    this.loadPortfolios();
    this.loadAssetTypes();
  }

  loadPortfolios(): void {
    this.portfolioService.getPortfolios().subscribe({
      next: portfolios => {
        this.portfolios = portfolios;
        if (portfolios.length > 0) {
          this.selectedPortfolioId = portfolios[0].id;
          this.loadPortfolioItems(this.selectedPortfolioId);
        }
      },
      error: err => {
        console.error('Error loading portfolios', err);
        this.isLoading = false;
      }
    });
  }

  loadAssetTypes(): void {
    this.assetTypeService.getAssetTypes().subscribe({
      next: types => this.assetTypes = types,
      error: err => console.error('Error loading asset types', err)
    });
  }

  loadPortfolioItems(portfolioId: number): void {
    this.isLoading = true;
    this.portfolioItemService.getPortfolioItemsByPortfolio(portfolioId).subscribe({
      next: items => {
        this.portfolioItems = items;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading items', err);
        this.isLoading = false;
      }
    });
  }

  getAssetTypeName(id: number): string {
    const type = this.assetTypes.find(t => t.id === id);
    return type ? type.name : 'Unknown';
  }

  onPortfolioChange(): void {
    if (this.selectedPortfolioId !== null) {
      this.loadPortfolioItems(this.selectedPortfolioId);
    }
  }

  onItemCreated(item: PortfolioItem): void {
    this.portfolioItems.push(item);
    this.showForm = false;
  }

  deletePortfolioItem(id: number): void {
    this.portfolioItemService.deletePortfolioItem(id).subscribe({
      next: () => {
        this.portfolioItems = this.portfolioItems.filter(item => item.id !== id);
      },
      error: err => {
        console.error('Error deleting item', err);
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onCancel(): void {
    this.showForm = false;
  }  
}
