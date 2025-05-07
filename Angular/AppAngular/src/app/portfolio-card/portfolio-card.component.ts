import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioOverview } from '../model/portfolio-overview';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-portfolio-card',
  standalone: true, // Uses Angular's standalone component architecture
  imports: [CommonModule, RouterModule], // Enables *ngIf, *ngFor, routerLink, etc.
  templateUrl: './portfolio-card.component.html',
  styleUrls: ['./portfolio-card.component.scss']
})
export class PortfolioCardComponent {
  // Portfolio object passed in from parent component (e.g. PortfolioListComponent)
  @Input() portfolio!: PortfolioOverview;

  // Emits the portfolio ID back to the parent component after deletion
  @Output() deleted = new EventEmitter<number>();

  // Tracks whether delete operation is currently in progress (e.g., for showing a spinner)
  isDeleting: boolean = false;

  constructor(private portfolioService: PortfolioService) {}

  /**
   * Triggered when user clicks the delete button.
   * Prompts for confirmation, then calls the PortfolioService to delete the portfolio.
   * On success, emits an event to notify the parent to update its list.
   */
  confirmDelete(event: Event): void {
    // Prevent default anchor behavior and event bubbling
    event.preventDefault();
    event.stopPropagation();

    // Ask the user for confirmation before deleting
    if (!confirm(`Are you sure you want to delete "${this.portfolio.name}"?`)) {
      return; // User cancelled the action
    }

    this.isDeleting = true;

    // Call the service to delete the portfolio by its ID
    this.portfolioService.deletePortfolio(this.portfolio.id).subscribe({
      next: () => {
        console.log(`Deleted portfolio ${this.portfolio.id}`);
        this.deleted.emit(this.portfolio.id); // Inform parent component
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
