import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the structure of the response from backend
export interface YahooFinanceData {
  symbol: string;
  name: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class YahooFinanceService {
  private baseUrl = 'http://localhost:5215/api'; // 👈 use your real backend port!

  constructor(private http: HttpClient) {}

  getTickerInfo(ticker: string): Observable<YahooFinanceData> {
    return this.http.get<YahooFinanceData>(`${this.baseUrl}/yahoo?ticker=${ticker}`);
  }
}
