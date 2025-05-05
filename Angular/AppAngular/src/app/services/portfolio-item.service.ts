import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': localStorage.getItem('headerValue') ?? ''
    });
  }

  getByPortfolio(portfolioId: number): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/portfolios/${portfolioId}`, {
      headers: this.getAuthHeaders()
    });
  }

  create(item: PortfolioItem): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(this.baseUrl, item, {
      headers: this.getAuthHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getSummary(portfolioId: number): Observable<PortfolioSummary> {
    return this.http.get<PortfolioSummary>(
      `${this.baseUrl}/summary/${portfolioId}`,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  sellPortfolioItem(sellRequest: { id: number; exitPrice: number; exitDate: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/sell`, sellRequest, {
      headers: this.getAuthHeaders()
    });
  }

  update(item: PortfolioItem): Observable<PortfolioItem> {
    return this.http.put<PortfolioItem>(`${this.baseUrl}/update`, item, {
      headers: this.getAuthHeaders()
    });
  }
}
