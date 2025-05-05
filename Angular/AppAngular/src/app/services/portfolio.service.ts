import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Portfolio } from '../model/portfolio';
import { Observable } from 'rxjs';
import { PortfolioOverview } from '../model/portfolio-overview';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  baseUrl: string = "http://localhost:5215/api";

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': localStorage.getItem('headerValue') ?? ''
    });
  }

  getPortfolios(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.baseUrl}/portfolio`, {
      headers: this.getAuthHeaders()
    });
  }

  getPortfolio(id: number): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.baseUrl}/portfolio/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createPortfolio(portfolio: Portfolio): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.baseUrl}/portfolio`, portfolio, {
      headers: this.getAuthHeaders()
    });
  }

  deletePortfolio(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/portfolio/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllOverviews(): Observable<PortfolioOverview[]> {
    return this.http.get<PortfolioOverview[]>(`${this.baseUrl}/portfolio/overview`, {
      headers: this.getAuthHeaders()
    });
  }
}
