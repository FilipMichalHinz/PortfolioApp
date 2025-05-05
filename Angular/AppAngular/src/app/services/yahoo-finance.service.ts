import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface describing the expected structure of the API response
export interface YahooFinanceData {
  symbol: string; // Ticker symbol (e.g., AAPL)
  name: string;   // Full company name (e.g., Apple Inc.)
  price: number;  // Current market price
}

@Injectable({
  providedIn: 'root' // Makes this service available application-wide
})
export class YahooFinanceService {
  // Base URL for the backend API
  private baseUrl = 'http://localhost:5215/api';

  constructor(private http: HttpClient) {}

  /**
   * Fetches current Yahoo Finance data for a given ticker symbol.
   * The backend API is expected to return an object containing symbol, name, and price.
   * @param ticker - The stock symbol (e.g., "GOOG")
   * @returns Observable of YahooFinanceData
   */
  getTickerInfo(ticker: string): Observable<YahooFinanceData> {
    return this.http.get<YahooFinanceData>(`${this.baseUrl}/yahoo?ticker=${ticker}`);
  }
}
