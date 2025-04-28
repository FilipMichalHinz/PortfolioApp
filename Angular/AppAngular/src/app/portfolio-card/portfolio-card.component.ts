
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { PortfolioOverview }  from '../model/portfolio-overview';
import { PortfolioService }   from '../services/portfolio.service';

@Component({
  selector: 'app-portfolio-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portfolio-card.component.html',
  styleUrls: ['./portfolio-card.component.scss']
})
export class PortfolioCardComponent {
  @Input() portfolio!: PortfolioOverview;
  @Output() deleted = new EventEmitter<number>();

  constructor(private portfolioService: PortfolioService) {}

  confirmDelete(event: Event): void {
    // Prevent link navigation. See portfolio-list for more details
    event.preventDefault();
    event.stopPropagation();

    // Simple confirmation dialog
    if (!confirm(`Are you sure you want to delete "${this.portfolio.portfolioName}"?`)) {
      return;
    }

    // Call backend to delete
    this.portfolioService.deletePortfolio(this.portfolio.id).subscribe({ // we use deletePortfolio from portfolio.service
      next: () => {
        console.log(`Deleted portfolio ${this.portfolio.id}`);
        this.deleted.emit(this.portfolio.id);
      },
      error: err => {
        console.error('Error deleting portfolio:', err);
        alert('Delete failed: ' + (err.message || 'Unknown error'));
      }
    });
  }
}

