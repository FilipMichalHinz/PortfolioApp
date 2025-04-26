import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { PortfolioItemService } from '../services/portfolio-item.service';
import { PortfolioService } from '../services/portfolio.service';
import { Portfolio } from '../model/portfolio';
import { PortfolioSummary } from '../model/portfolio-summary';
import { PortfolioItemFormComponent } from '../portfolio-item-form/portfolio-item-form.component';
import { PortfolioItem } from '../model/portfolio-item';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PortfolioItemFormComponent],
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.css']
})
export class PortfolioDetailComponent implements OnInit {
  portfolio!: Portfolio;
  summary!: PortfolioSummary;
  isLoading = true;
  showForm = false;

  constructor(
    private route: ActivatedRoute,
    private itemSvc: PortfolioItemService,
    private portfolioSvc: PortfolioService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.portfolioSvc.getPortfolio(id).subscribe({
      next: p => this.portfolio = p,
      error: err => console.error('Error loading portfolio', err)
    });

    this.loadSummary(id);
  }

  private loadSummary(id: number): void {
    this.isLoading = true;
    this.itemSvc.getSummary(id).subscribe({
      next: sum => {
        this.summary = sum;
        this.isLoading = false;
      },
      error: err => console.error('Error loading summary', err)
    });
  }

  onItemCreated(item: PortfolioItem): void {
    this.showForm = false;
    // reload summary to include the new item
    this.loadSummary(this.summary.portfolioId);
  }

  onCancel(): void {
    this.showForm = false;
  }
}
