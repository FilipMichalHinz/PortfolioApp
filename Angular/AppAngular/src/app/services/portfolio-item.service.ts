import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PortfolioItem } from '../model/portfolio-item';
import { Observable } from 'rxjs';
import { PortfolioSummary } from '../model/portfolio-summary';




@Injectable({
  providedIn: 'root'
})
export class PortfolioItemService {
  baseUrl: string = 'http://localhost:5215/api/portfolioitem';

  constructor(private http: HttpClient) {}

  // We're not gonna need this
  /* getPortfolioItems(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/portfolioitem`);
  } */ 

  getByPortfolio(portfolioId: number): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/portfolios/${portfolioId}`);
  }

  /* getPortfolioItem(id: number): Observable<PortfolioItem> {
    return this.http.get<PortfolioItem>(`${this.baseUrl}/portfolioitem/${id}`);
  } */ 

  create(item: PortfolioItem): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(this.baseUrl, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // For individual item/asset "performance"
  getSummary(portfolioId: number): Observable<PortfolioSummary> {
    return this.http.get<PortfolioSummary>(
      `${this.baseUrl}/summary/${portfolioId}`
    );
  }
}


