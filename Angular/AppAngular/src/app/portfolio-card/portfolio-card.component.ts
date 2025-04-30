import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PortfolioOverview } from '../model/portfolio-overview';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-portfolio-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portfolio-card.component.html',
  styleUrls: ['./portfolio-card.component.scss']
})
export class PortfolioCardComponent {
  @Input() portfolio!: PortfolioOverview; // 📦 Portfolio data coming from parent (PortfolioListComponent)
  @Output() deleted = new EventEmitter<number>(); // 📤 Emit event back to parent when deleted

  isDeleting: boolean = false; // 🔄 Show small visual if delete is in progress (optional UX polish)

  constructor(private portfolioService: PortfolioService) {}

  /**
   * 🔹 Confirm and delete a portfolio
   * 🔹 Called when user clicks delete button
   */
  confirmDelete(event: Event): void {
    event.preventDefault(); // 🚫 Prevent link navigation
    event.stopPropagation(); // 🚫 Stop event from bubbling up

    if (!confirm(`Are you sure you want to delete "${this.portfolio.portfolioName}"?`)) {
      return; // ❌ Cancel if user says no
    }

    this.isDeleting = true; // 🔄 Start loading state

    this.portfolioService.deletePortfolio(this.portfolio.id).subscribe({
      next: () => {
        console.log(`Deleted portfolio ${this.portfolio.id}`);
        this.deleted.emit(this.portfolio.id); // 📤 Notify parent component to remove it from list
        this.isDeleting = false;
      },
      error: err => {
        console.error('Error deleting portfolio:', err);
        alert('Delete failed: ' + (err.message || 'Unknown error'));
        this.isDeleting = false;
      }
    });
  }
  
  
}
