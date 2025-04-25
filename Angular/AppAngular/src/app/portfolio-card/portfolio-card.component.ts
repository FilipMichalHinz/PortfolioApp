

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { PortfolioOverview }  from '../model/portfolio-overview';

@Component({
  selector: 'app-portfolio-card',
  standalone: true,
  imports: [CommonModule],   // for currency pipe, etc.
  templateUrl: './portfolio-card.component.html',
  styleUrls: ['./portfolio-card.component.scss']
})
export class PortfolioCardComponent {
  // Tell Angular this component accepts a "portfolio" property:
  @Input() portfolio!: PortfolioOverview;

  //  Tell Angular this component emits "deleted" events of type number:
  @Output() deleted = new EventEmitter<number>();

  deletePortfolio(): void {
    // Emit the portfolio's id (a number)
    this.deleted.emit(this.portfolio.id);
  }
}

