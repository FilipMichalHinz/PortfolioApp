import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Watchlist } from '../model/watchlist';
import { Observable } from 'rxjs';

// import { YahooFinanceData } from './yahoo-finance.service';


export interface WatchlistItem {
    id?: number;
    userId?: number;
    ticker: string;
    assetName: string;
    targetPrice: number;
    // always present, even if null
    currentPrice?: number | null; // filled when we fetch prices from yahoo
    
}

export interface YahooFinanceData {
    symbol: string;
    name: string;
    price: number;
}
    @Injectable({
    providedIn: 'root'
  })

  export class WatchlistService {
    private baseUrl: string = 'http://localhost:5215/api/watchlist';
    private yahoo: string = 'http://localhost:5215/api/yahoo';

    constructor(private http: HttpClient) {}

    //get credentials from login in storage
    private getAuthHeaders(): { headers: HttpHeaders } {
        const token = localStorage.getItem('headerValue') || '';
        return {
            headers: new HttpHeaders().set("Authorization", token)
        };
        }

    // fetch raw watchlist rows
    getWatchlistItems(): Observable<WatchlistItem[]> {
        return this.http.get<WatchlistItem[]>(
            this.baseUrl,
            this.getAuthHeaders()
        );

    }

    //fetch asset name and symbol using yf controller
    getTickerInfo(ticker: string): Observable<YahooFinanceData> {
        return this.http.get<YahooFinanceData>(`${this.yahoo}?ticker=${ticker}`);
    }

// fetch watchlist items with prices and merge them
    getWatchlistItemsWithPrices(): Observable<WatchlistItem[]> {
        return this.http.get<WatchlistItem[]>(
            '${this.baseUrl}/with-prices',
            this.getAuthHeaders()
        );
        /* switchMap(items =>{
                if(items.length === 0) {
                    return of(items);
                }

                // loop through items and get prices from yf 
                const calls = items.map(item => 
                    this.getTickerInfo(item.ticker).pipe(
                        map(info => ({
                            ...item,
                            assetName: info.name,
                            currentPrice: info.price
                            })),
                        catchError(err => 
                            // if error, return item with no price
                            of({...item, currentPrice: null})
                        )
                    )
                );
                //When all calls are done, return the merged items
                return forkJoin(calls);
            }) */
        
    }

    // add new item
    add(item: Partial<WatchlistItem>): Observable<WatchlistItem> { // partial, so we can pass without userid 
        return this.http.post<WatchlistItem>(
            this.baseUrl, 
            item,
            this.getAuthHeaders()
        );
    }

    //update item (only target price)
    update(id: number, targetPrice: number): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, targetPrice); // Send the price directly
    }

    // delete item
    delete(id: number): Observable<void> {
        return this.http.delete<void>(
            `${this.baseUrl}/${id}`,
            this.getAuthHeaders()
        );
    }
  }
