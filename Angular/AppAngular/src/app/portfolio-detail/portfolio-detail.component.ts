

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { ActivatedRoute }    from '@angular/router';

import { PortfolioItemService }   from '../services/portfolio-item.service';
import { PortfolioSummary, AssetPerformance } from '../model/portfolio-summary';
import { PortfolioService }       from '../services/portfolio.service';
import { Portfolio }              from '../model/portfolio'; 

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-detail.component.html',
  styleUrls: ['./portfolio-detail.component.css']
})
export class PortfolioDetailComponent implements OnInit {
  summary!: PortfolioSummary;
  isLoading = true;

  portfolio!: Portfolio; //Field to hold protfolio metadata

  constructor(
    private route: ActivatedRoute,
    private itemSvc: PortfolioItemService,
    private portfolioSvc: PortfolioService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.portfolioSvc.getPortfolio(id).subscribe({
           next: p => this.portfolio = p,
           error: err => console.error('Error loading portfolio', err)
         });
         
    this.itemSvc.getSummary(id).subscribe({
      next: sum => {
        this.summary = sum;
        this.isLoading = false;
      },
      error: err => console.error(err)
    });
  }
}

