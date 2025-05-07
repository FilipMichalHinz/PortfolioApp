import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Portfolio } from '../model/portfolio';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-portfolio-form',
  standalone: true, // This component does not rely on an NgModule
  imports: [CommonModule, FormsModule], // Required for template syntax like ngIf and ngModel
  templateUrl: './portfolio-form.component.html',
  styleUrls: ['./portfolio-form.component.css']
})
export class PortfolioFormComponent {
  // Emits the newly created Portfolio object to the parent component
  @Output() created = new EventEmitter<Portfolio>();

  // Controls whether the form is visible
  showForm = false;

  // Object bound to the input fields in the form
  newPortfolio: Portfolio = {
    id: 0,
    name: '',
    createdAt: new Date()
  };

  constructor(private portfolioService: PortfolioService) {}

  // Toggles visibility of the form
  toggleForm() {
    this.showForm = !this.showForm;
  }

  // Triggered when the form is submitted
  onSubmit(): void {
    // Only proceed if input is valid (non-empty portfolio name)
    if (this.isValid()) {
      this.newPortfolio.createdAt = new Date(); // Set current timestamp

      // Call the service to persist the new portfolio
      this.portfolioService.createPortfolio(this.newPortfolio).subscribe({
        next: created => {
          // Notify parent component with newly created portfolio
          this.created.emit(created);

          // Reset form state and hide form
          this.resetForm();
          this.showForm = false;
        }
      });
    }
  }

  // Resets the form input model to initial state
  resetForm() {
    this.newPortfolio = {
      id: 0,
      name: '',
      createdAt: new Date()
    };
  }

  // Triggered when user cancels the form input
  cancel() {
    this.resetForm();
    this.showForm = false;
  }

  // Returns true if the form input is valid (non-empty name)
  isValid(): boolean {
    return this.newPortfolio.name.trim() !== '';
  }
}
