// =============================
// File: portfolio-item.service.ts
// Description:
// Service for managing portfolio items. Handles CRUD operations, 
// fetching portfolio summaries, and marking items as sold.
// All requests are authenticated using a header stored in localStorage.
// =============================

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PortfolioItem } from '../model/portfolio-item';
import { Observable } from 'rxjs';
import { PortfolioSummary } from '../model/portfolio-summary';

@Injectable({
  providedIn: 'root' // This service is provided globally in the app
})
export class PortfolioItemService {
  // Base URL for all portfolio item-related endpoints
  baseUrl: string = 'http://localhost:5215/api/asset';

  constructor(private http: HttpClient) {}

  /**
   * Returns authentication headers using the locally stored basic auth token.
   * @returns HttpHeaders with the Authorization header
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('headerValue'); // Fetch the token from localStorage
    // Debugging: Uncomment the line below if needed to debug token
    // console.log('Token being sent by PortfolioItemService:', token);
    return new HttpHeaders({
      'Authorization': token ?? '' // Sends: "Authorization: Basic YWxpY2U6cGFzc3dvcmQ="
    });
  }

  /**
   * Fetches all portfolio items associated with a given portfolio.
   * @param portfolioId - ID of the portfolio
   * @returns Observable of PortfolioItem[] (list of portfolio items)
   */
  getByPortfolio(portfolioId: number): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/portfolios/${portfolioId}`, {
      headers: this.getAuthHeaders() // Include the Authorization header
    });
  }

  /**
   * Creates a new portfolio item.
   * @param item - The portfolio item to create
   * @returns Observable of the created PortfolioItem
   */
  create(item: PortfolioItem): Observable<PortfolioItem> {
    return this.http.post<PortfolioItem>(this.baseUrl, item, {
      headers: this.getAuthHeaders() // Include the Authorization header
    });
  }

  /**
   * Deletes a portfolio item by ID.
   * @param id - ID of the portfolio item to delete
   * @returns Observable<void>
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders() // Include the Authorization header
    });
  }

  /**
   * Fetches a computed summary of all items in a portfolio, including profit/loss and allocation data.
   * Used for the detailed portfolio dashboard view.
   * @param portfolioId - ID of the portfolio
   * @returns Observable of PortfolioSummary (includes performance metrics)
   */
  getSummary(portfolioId: number): Observable<PortfolioSummary> {
    return this.http.get<PortfolioSummary>(
      `${this.baseUrl}/summary/${portfolioId}`,
      {
        headers: this.getAuthHeaders() // Include the Authorization header
      }
    );
  }

  /**
   * Marks a portfolio item as sold by providing exit price and exit date.
   * @param sellRequest - Object containing item ID, exit price, and exit date
   * @returns Observable<any> (backend response)
   */
  sellPortfolioItem(sellRequest: { id: number; exitPrice: number; exitDate: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/sell`, sellRequest, {
      headers: this.getAuthHeaders() // Include the Authorization header
    });
  }

  /**
   * Updates details of an existing portfolio item (e.g., after editing).
   * @param item - The updated portfolio item
   * @returns Observable of the updated PortfolioItem
   */
  update(item: PortfolioItem): Observable<PortfolioItem> {
    return this.http.put<PortfolioItem>(`${this.baseUrl}/update`, item, {
      headers: this.getAuthHeaders() // Include the Authorization header
    });
  }
}
