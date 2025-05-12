// =============================
// File: watchlist.service.ts
// Description:
// Service for handling watchlist-related operations via backend API.
// Provides methods for fetching, adding, updating, and deleting watchlist items,
// as well as retrieving current market data via YahooFinance integration.
// =============================

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Defines the shape of a single watchlist item
export interface WatchlistItem {
  id?: number;
  userId?: number;
  ticker: string;
  assetName: string;
  targetPrice: number;
  currentPrice?: number | null; // Can be null if price lookup fails
}

// Defines the structure of the Yahoo Finance API response
export interface YahooFinanceData {
  symbol: string;
  name: string;
  price: number;
}

@Injectable({
  providedIn: 'root' // Makes the service available throughout the app
})
export class WatchlistService {
  private baseUrl: string = 'http://localhost:5215/api/watchlist'; // API endpoint for watchlist
  private yahoo: string = 'http://localhost:5215/api/yahoo';       // API endpoint for Yahoo Finance proxy

  constructor(private http: HttpClient) {}

  /**
   * Generates HTTP headers with authentication token from localStorage.
   * Required for all protected backend endpoints.
   */
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('headerValue') || '';
    return {
      headers: new HttpHeaders().set("Authorization", token)
    };
  }

  /**
   * Retrieves all watchlist entries for the logged-in user.
   * @returns Observable with list of WatchlistItem objects
   */
  getWatchlistItems(): Observable<WatchlistItem[]> {
    return this.http.get<WatchlistItem[]>(
      this.baseUrl,
      this.getAuthHeaders()
    );
  }

  /**
   * Fetches live market data (name + price) for a specific ticker symbol.
   * @param ticker - Stock ticker symbol (e.g., "TSLA")
   * @returns Observable of YahooFinanceData
   */
  getTickerInfo(ticker: string): Observable<YahooFinanceData> {
    return this.http.get<YahooFinanceData>(`${this.yahoo}?ticker=${ticker}`);
  }

  /**
   * Fetches watchlist items with attached live prices.
   * This endpoint is expected to merge item metadata and price data.
   * (NOTE: Currently a placeholder, actual merging logic is in the backend.)
   */
  getWatchlistItemsWithPrices(): Observable<WatchlistItem[]> {
    return this.http.get<WatchlistItem[]>(
      `${this.baseUrl}/with-prices`,
      this.getAuthHeaders()
    );

    // Previously: Client-side merging via switchMap and forkJoin (commented out)
  }

  /**
   * Adds a new watchlist item (e.g., user adds TSLA at $180).
   * @param item - Partial WatchlistItem (userId will be resolved on backend)
   * @returns Observable of created WatchlistItem
   */
  add(item: Partial<WatchlistItem>): Observable<WatchlistItem> {
    return this.http.post<WatchlistItem>(
      this.baseUrl,
      item,
      this.getAuthHeaders()
    );
  }

  /**
   * Updates the target price of a specific watchlist item.
   * @param id - ID of the item to update
   * @param targetPrice - New price target
   * @returns Observable of any backend response
   */
  update(id: number, targetPrice: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${id}`,
      targetPrice,
      this.getAuthHeaders()
    );
  }

  /**
   * Deletes a watchlist item by its ID.
   * @param id - ID of the item to delete
   * @returns Observable<void>
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`,
      this.getAuthHeaders()
    );
  }
}
