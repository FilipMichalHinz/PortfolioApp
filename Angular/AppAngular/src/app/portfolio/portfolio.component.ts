import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Portfolio } from '../model/portfolio';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../services/portfolio.service';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})

export class PortfolioComponent {
  @Input() portfolio!: Portfolio;
  @Output() deleted = new EventEmitter<number>();

  mode: number = 1;

  constructor(private portfolioService: PortfolioService) {}

  deletePortfolio(): void {
    if (confirm(`Delete portfolio ${this.portfolio.portfolioName}?`)) {
      this.portfolioService.deletePortfolio(this.portfolio.id).subscribe(() => {
        this.deleted.emit(this.portfolio.id); // informiert die Eltern-Komponente
      });
    }
  }

  /* Past:
  deleteUser(): void {
    this.userService.deleteUser(this.user!.id).subscribe();
  }
  */
}
