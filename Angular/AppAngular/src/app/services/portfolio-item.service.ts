import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PortfolioItem } from '../model/portfolio-item';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioItemService {
  baseUrl: string = 'http://localhost:5215/api';

  constructor(private http: HttpClient) {}

  getPortfolioItems(): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/portfolioitem`);
  }

  getPortfolioItemsByPortfolio(portfolioId: number): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/portfolioitem/user/${portfolioId}`);
  }

  getPortfolioItem(id: number): Observable<PortfolioItem> {
    return this.http.get<PortfolioItem>(`${this.baseUrl}/portfolioitem/${id}`);
  }

  createPortfolioItem(item: PortfolioItem): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(`${this.baseUrl}/portfolioitem`, item);
  }

  deletePortfolioItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/portfolioitem/${id}`);
  }
}
