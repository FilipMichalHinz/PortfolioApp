

import { Component, OnInit }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Portfolio } from '../model/portfolio';
import { PortfolioService } from '../services/portfolio.service';

import { PortfolioItem } from '../model/portfolio-item';
import { PortfolioItemService } from '../services/portfolio-item.service';
import { PortfolioItemFormComponent } from '../portfolio-item-form/portfolio-item-form.component';

import { AssetType }  from '../model/asset-type';
import { AssetTypeService } from '../services/asset-type.service';

@Component({
  selector: 'app-portfolio-item-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,            // for ngModel on the dropdown
    RouterModule,            // for ActivatedRoute & Router
    PortfolioItemFormComponent // for the child form
  ],
  templateUrl: './portfolio-item-list.component.html',
  styleUrls: ['./portfolio-item-list.component.css']
})
export class PortfolioItemListComponent implements OnInit {
  // drop down paramters
  portfolios: Portfolio[] = [];
  selectedPortfolioId!: number;

  // Data to display
  portfolioItems: PortfolioItem[] = [];
  assetTypes:    AssetType[]      = [];

  // UI state
  isLoading = true;
  showForm   = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portfolioService: PortfolioService,
    private itemService: PortfolioItemService,
    private assetTypeService: AssetTypeService
  ) {}

  ngOnInit(): void {
    //  Load all portfolios for the dropdown
    this.portfolioService.getPortfolios().subscribe({
      next: list => {
        this.portfolios = list;

        //  Pick initial ID: from URL if present, otherwise first portfolio
        const idParam = this.route.snapshot.paramMap.get('id');
        this.selectedPortfolioId = idParam
          ? Number(idParam)
          : (list.length > 0 ? list[0].id : 0);

        // Reflect that in the URL (so refresh/bookmark works)
        this.router.navigate(
          ['/portfolio', this.selectedPortfolioId],
          { replaceUrl: true }
        );

        // Load items and types
        this.loadPortfolioItems();
        this.loadAssetTypes();
      },
      error: err => console.error('Error loading portfolios', err)
    });
  }

  /** Called by (change) on the dropdown */
  onPortfolioChange(): void {
    // Keep URL & UI in sync
    this.router.navigate(['/portfolio', this.selectedPortfolioId]);
    this.loadPortfolioItems();
  }

  private loadAssetTypes(): void {
    this.assetTypeService.getAssetTypes().subscribe({
      next: types => (this.assetTypes = types),
      error: err => console.error('Error loading asset types', err)
    });
  }

  private loadPortfolioItems(): void {
    this.isLoading = true;
    this.itemService
      .getByPortfolio(this.selectedPortfolioId)
      .subscribe({
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

  // Template helper to show asset type names
  getAssetTypeName(id: number): string {
    const t = this.assetTypes.find(x => x.id === id);
    return t ? t.name : 'Unknown';
  }

  // Handle creation from the child form 
  onItemCreated(item: PortfolioItem): void {
    this.portfolioItems.push(item);
    this.showForm = false;
  }

  // Delete an item locally + on server 
  delete(id: number): void {
    this.itemService.delete(id).subscribe({
      next: () => {
        this.portfolioItems = this.portfolioItems.filter(i => i.id !== id);
      },
      error: err => console.error('Error deleting item', err)
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  onCancel(): void {
    this.showForm = false;
  }
}
