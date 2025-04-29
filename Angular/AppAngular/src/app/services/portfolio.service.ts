import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Portfolio } from '../model/portfolio';
import { Observable } from 'rxjs';
import {PortfolioOverview} from '../model/portfolio-overview';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  baseUrl: string = "http://localhost:5215/api";

  get authHeader(): string {
    return localStorage["headerValue"]; //"Basic am9obi5kb2U6VmVyeVNlY3JldCE=";
  }

  constructor(private http: HttpClient) {}

  getPortfolios(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.baseUrl}/portfolio`);
  }
  getPortfolio(id: number): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.baseUrl}/portfolio/${id}`);
  }
  createPortfolio(portfolio: Portfolio): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.baseUrl}/portfolio`, portfolio);
  }
  deletePortfolio(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/portfolio/${id}`);
  }

  getAllOverviews(): Observable<PortfolioOverview[]> {
    return this.http.get<PortfolioOverview[]>(
      `${this.baseUrl}/portfolio/overview`
    );
  }



}
