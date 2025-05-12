// =============================
// File: portfolio-form.component.ts
// Description:
// Defines the PortfolioFormComponent as a standalone Angular component.
// Provides a form to create new portfolio entries, validate user input,
// and communicate results back to the parent via EventEmitters.
// Handles state toggling, form submission, and cancellation logic.
// Integrates shared and core Angular modules for form functionality.
// =============================

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Portfolio } from '../model/portfolio';
import { PortfolioService } from '../services/portfolio.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-portfolio-form',
  standalone: true, // Component uses Angular standalone API
  imports: [CommonModule, FormsModule, SharedModule], // Provides common directives and shared components
  templateUrl: './portfolio-form.component.html',
  styleUrls: ['./portfolio-form.component.css']
})
export class PortfolioFormComponent {
  // Emits the created portfolio to the parent component after successful form submission
  @Output() created = new EventEmitter<Portfolio>();

  // Emits a signal to parent when the form is canceled
  @Output() cancelled = new EventEmitter<void>();

  // Controls whether the form is currently visible in the UI
  showForm = false;

  // Form model object bound to user input fields
  newPortfolio: Portfolio = {
    id: 0,
    name: '',
    createdAt: new Date()
  };

  constructor(private portfolioService: PortfolioService) {}

  // Toggles visibility of the form section (used e.g. by a button click)
  toggleForm() {
    this.showForm = !this.showForm;
  }

  // Handles form submission logic
  onSubmit(): void {
    // Proceed only if the input passes validation
    if (this.isValid()) {
      // Stamp creation time
      this.newPortfolio.createdAt = new Date();

      // Send data to backend service and wait for response
      this.portfolioService.createPortfolio(this.newPortfolio).subscribe({
        next: created => {
          // Emit event with the newly created portfolio object
          this.created.emit(created);

          // Reset the form for future input
          this.resetForm();
        }
      });
    } else {
      // Notify user about missing or invalid input
      alert('Please fill in all required fields correctly.');
    }
  }

  // Resets the form input to default state
  resetForm() {
    this.newPortfolio = {
      id: 0,
      name: '',
      createdAt: new Date()
    };
  }

  // Cancels form input and notifies parent component
  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  // Validates form input (name must be non-empty and non-whitespace)
  isValid(): boolean {
    return this.newPortfolio.name.trim() !== '';
  }
}
