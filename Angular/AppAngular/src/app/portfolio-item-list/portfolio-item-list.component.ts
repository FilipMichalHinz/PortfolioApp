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
import { YahooFinanceService } from '../services/yahoo-finance.service'; // 🆕 Service to fetch Name based on Ticker

@Component({
  selector: 'app-portfolio-item-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,            // 🔹 Needed for ngModel in dropdown
    RouterModule,           // 🔹 For navigation between portfolios
    PortfolioItemFormComponent // 🔹 Include child form component
  ],
  templateUrl: './portfolio-item-list.component.html',
  styleUrls: ['./portfolio-item-list.component.css']
})
export class PortfolioItemListComponent implements OnInit {
  // 🔹 Data for the dropdown
  portfolios: Portfolio[] = [];
  selectedPortfolioId!: number;

  // 🔹 Data for table display
  portfolioItems: PortfolioItem[] = [];
  assetTypes:    AssetType[]      = [];

  // 🔹 UI State flags
  isLoading = true;
  showForm   = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portfolioService: PortfolioService,
    private itemService: PortfolioItemService,
    private assetTypeService: AssetTypeService,
    private yahooService: YahooFinanceService // 🆕 Inject Yahoo Finance service
  ) {}

  ngOnInit(): void {
    if (this.portfolioService.authHeader == null) {
      this.router.navigate(["login"]);
      return;
    }
    // 🔹 First load portfolios
    this.portfolioService.getPortfolios().subscribe({
      next: list => {
        this.portfolios = list;

        // 🔹 Set selected portfolio ID from URL or default to first
        const idParam = this.route.snapshot.paramMap.get('id');
        this.selectedPortfolioId = idParam
          ? Number(idParam)
          : (list.length > 0 ? list[0].id : 0);

        // 🔹 Load portfolio items and asset types
        this.loadPortfolioItems();
        this.loadAssetTypes();
      },
      error: err => console.error('Error loading portfolios', err)
    });
  }

  /** 🔹 Called when user selects different portfolio in dropdown */
  onPortfolioChange(): void {
    this.router.navigate(['/portfolio', this.selectedPortfolioId]);
    this.loadPortfolioItems();
  }

  /** 🔹 Load Asset Types for showing asset type names */
  private loadAssetTypes(): void {
    this.assetTypeService.getAssetTypes().subscribe({
      next: types => (this.assetTypes = types),
      error: err => console.error('Error loading asset types', err)
    });
  }

  /** 🔹 Load all portfolio items for selected portfolio */
  private loadPortfolioItems(): void {
    this.isLoading = true;
    this.itemService.getByPortfolio(this.selectedPortfolioId).subscribe({
      next: items => {
        this.portfolioItems = items;
        this.isLoading = false;
        this.updateNames(); // 🧠 Fetch full Name for each item based on Ticker
      },
      error: err => {
        console.error('Error loading items', err);
        this.isLoading = false;
      }
    });
  }

  /** 🔹 Update each item's Name by fetching from YahooFinanceService */
  private updateNames(): void {
    if (!this.portfolioItems || this.portfolioItems.length === 0) {
      console.warn('No portfolio items to update names for.');
      return;
    }
  
    for (const item of this.portfolioItems) {
      if (item.ticker) {
        console.log('Fetching name for ticker:', item.ticker); // 🧠 Debug output
        this.yahooService.getTickerInfo(item.ticker).subscribe({
          next: (data) => {
            console.log('Fetched Yahoo Data:', data); // 🧠 See the response
            item.name = data.name;
          },
          error: (err) => {
            console.error(`Failed to fetch name for ${item.ticker}`, err);
            item.name = 'Unknown';
          }
        });
      } else {
        console.warn('Portfolio item missing ticker:', item); // 🧠 Warn if ticker missing
      }
    }
  }
  
  

  /** 🔹 Helper to show asset type name from ID */
  getAssetTypeName(id: number): string {
    const t = this.assetTypes.find(x => x.id === id);
    return t ? t.name : 'Unknown';
  }

  /** 🔹 Handle event from child form when new item created */
  onItemCreated(item: PortfolioItem): void {
    this.portfolioItems.push(item);
    this.showForm = false;
  }

  /** 🔹 Delete item locally and from backend */
  delete(id: number): void {
    this.itemService.delete(id).subscribe({
      next: () => {
        this.portfolioItems = this.portfolioItems.filter(i => i.id !== id);
      },
      error: err => console.error('Error deleting item', err)
    });
  }

  /** 🔹 Toggle the form visibility */
  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  /** 🔹 Close the form when canceled */
  onCancel(): void {
    this.showForm = false;
  }
}