// =============================
// File: portfolio-card.component.ts
// Description:
// Defines a reusable card component that displays a summary view of a single portfolio.
// Accepts a PortfolioOverview object as input and allows deletion via user confirmation.
// Emits events back to the parent component to trigger list updates after deletion.
// Integrates routing and shared modules for UI and behavior.
// =============================

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioOverview } from '../model/portfolio-overview';
import { PortfolioService } from '../services/portfolio.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-portfolio-card',
  standalone: true, // Uses Angular's standalone component architecture
  imports: [CommonModule, RouterModule, SharedModule], // Enables *ngIf, *ngFor, routerLink, etc.
  templateUrl: './portfolio-card.component.html',
  styleUrls: ['./portfolio-card.component.scss'],
})
export class PortfolioCardComponent {
  // Input binding: portfolio summary data to be displayed in the card
  @Input() portfolio!: PortfolioOverview;

  // Output event: notifies parent component when this portfolio is deleted
  @Output() deleted = new EventEmitter<number>();

  // Indicates whether a deletion is in progress (e.g., for disabling the UI)
  isDeleting: boolean = false;

  constructor(private portfolioService: PortfolioService) {}

  /**
   * Triggered when the user clicks the delete button.
   * Prevents default link behavior, confirms with user, and deletes via service.
   * Emits deletion event to parent on success.
   */
  confirmDelete(event: Event): void {
    event.preventDefault();   // Prevent navigation if inside a <a> tag
    event.stopPropagation();  // Prevent event bubbling (e.g., opening the card)

    // Ask for confirmation before proceeding
    if (!confirm(`Are you sure you want to delete "${this.portfolio.name}"?`)) {
      return; // Abort if user cancels
    }

    this.isDeleting = true;

    // Call backend via service to delete the portfolio
    this.portfolioService.deletePortfolio(this.portfolio.id).subscribe({
      next: () => {
        console.log(`Deleted portfolio ${this.portfolio.id}`);
        this.deleted.emit(this.portfolio.id); // Emit event for parent to update UI
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
