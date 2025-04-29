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

  get authHeader(): string {
    return localStorage["headerValue"]; //"Basic am9obi5kb2U6VmVyeVNlY3JldCE=";
  }

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
  sellPortfolioItem(sellRequest: { id: number; exitPrice: number; exitDate: string }) {
    return this.http.put(`${this.baseUrl}/sell`, sellRequest);
  }
}


