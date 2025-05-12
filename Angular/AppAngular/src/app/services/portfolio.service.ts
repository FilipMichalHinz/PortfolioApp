// =============================
// File: portfolio.service.ts
// Description:
// Service responsible for interacting with the backend API to manage portfolios.
// Includes methods for fetching portfolio details, creating, deleting, and fetching high-level overviews.
// All requests are authenticated using the header stored in localStorage.
// =============================

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Portfolio } from '../model/portfolio';
import { Observable } from 'rxjs';
import { PortfolioOverview } from '../model/portfolio-overview';

@Injectable({
  providedIn: 'root' // Makes the service globally available via Angular dependency injection
})
export class PortfolioService {
  // Base URL for backend API endpoints
  baseUrl: string = "http://localhost:5215/api";

  constructor(private http: HttpClient) {}

  /**
   * Retrieves the Authorization header containing the base64-encoded credentials.
   * This is required by the backend for all authenticated requests.
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': localStorage.getItem('headerValue') ?? '' // Get token from localStorage
    });
  }

  /**
   * Fetches a list of all portfolios (basic details only).
   * @returns Observable of Portfolio[]
   */
  getPortfolios(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.baseUrl}/portfolio`, {
      headers: this.getAuthHeaders() // Include authorization header
    });
  }

  /**
   * Fetches the full details of a single portfolio by ID.
   * @param id - Portfolio ID
   * @returns Observable of Portfolio
   */
  getPortfolio(id: number): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.baseUrl}/portfolio/${id}`, {
      headers: this.getAuthHeaders() // Include authorization header
    });
  }

  /**
   * Sends a POST request to create a new portfolio.
   * @param portfolio - Portfolio object to be created
   * @returns Observable of created Portfolio
   */
  createPortfolio(portfolio: Portfolio): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.baseUrl}/portfolio`, portfolio, {
      headers: this.getAuthHeaders() // Include authorization header
    });
  }

  /**
   * Sends a DELETE request to remove a portfolio by ID.
   * @param id - Portfolio ID
   * @returns Observable<any>
   */
  deletePortfolio(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/portfolio/${id}`, {
      headers: this.getAuthHeaders() // Include authorization header
    });
  }

  /**
   * Fetches a high-level overview for each portfolio, including performance metrics.
   * Used for the dashboard/portfolio list view.
   * @returns Observable of PortfolioOverview[]
   */
  getAllOverviews(): Observable<PortfolioOverview[]> {
    return this.http.get<PortfolioOverview[]>(`${this.baseUrl}/portfolio/overview`, {
      headers: this.getAuthHeaders() // Include authorization header
    });
  }
}
