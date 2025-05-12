// =============================
// File: yahoo-finance.service.ts
// Description:
// Service that handles communication with the backend to fetch stock data.
// Sends ticker symbols to the API and receives structured market data in return.
// Used throughout the app to resolve company names, prices, etc.
// =============================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface defining the structure of the Yahoo Finance API response
export interface YahooFinanceData {
  symbol: string; // Stock symbol (e.g., AAPL)
  name: string;   // Company name (e.g., Apple Inc.)
  price: number;  // Current market price
}

@Injectable({
  providedIn: 'root' // Service is injected globally throughout the application
})
export class YahooFinanceService {
  // Base URL of the backend API
  private baseUrl = 'http://localhost:5215/api';

  constructor(private http: HttpClient) {}

  /**
   * Fetches stock data for a specific ticker via backend proxy.
   * @param ticker - Stock ticker symbol (e.g., "GOOG")
   * @returns Observable containing symbol, name, and price
   */
  getTickerInfo(ticker: string): Observable<YahooFinanceData> {
    return this.http.get<YahooFinanceData>(`${this.baseUrl}/yahoo?ticker=${ticker}`);
  }
}
