import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Portfolio } from '../model/portfolio';

@Component({
  selector: 'app-portfolio-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio-form.component.html',
  styleUrls: ['./portfolio-form.component.css']
})
export class PortfolioFormComponent {
  @Output() created = new EventEmitter<Portfolio>();

  // Controls the visibility of the form
  showForm = false;

  newPortfolio: Portfolio = {
    id: 0,
    portfolioName: '',
    createdAt: new Date()
  };

  // Show the form
  toggleForm() {
    this.showForm = !this.showForm;
  }

  onSubmit() {
    if (this.isValid()) {
      this.newPortfolio.createdAt = new Date();
      this.created.emit(this.newPortfolio);
      this.resetForm();
      this.showForm = false;
    }
  }

  resetForm() {
    this.newPortfolio = {
      id: 0,
      portfolioName: '',
      createdAt: new Date()
    };
  }

  cancel() {
    this.resetForm();
    this.showForm = false;
  }

  isValid(): boolean {
    return this.newPortfolio.portfolioName.trim() !== ''
  }
}
