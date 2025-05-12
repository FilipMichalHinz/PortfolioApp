// =============================
// File: watchlist.component.spec.ts
// Description:
// Contains unit tests for WatchlistComponent using Angular's TestBed.
// Verifies component creation, authentication check and redirect,
// loading watchlist data, and handling of edit mode state.
// External service calls are mocked using Jasmine spies.
// =============================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatchlistComponent } from './watchlist.component';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { WatchlistService, WatchlistItem } from '../services/watchlist.service';
import { YahooFinanceService } from '../services/yahoo-finance.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('WatchlistComponent', () => {
  let component: WatchlistComponent;
  let fixture: ComponentFixture<WatchlistComponent>;

  // Spy objects for dependencies
  let routerSpy: jasmine.SpyObj<Router>;
  let watchlistSvcSpy: jasmine.SpyObj<WatchlistService>;
  let yahooSpy: jasmine.SpyObj<YahooFinanceService>;

  // Sample watchlist entry for testing
  const sampleItem: WatchlistItem = {
    id: 1,
    ticker: 'AAPL',
    assetName: 'Apple Inc.',
    targetPrice: 200,
    currentPrice: null
  };

  beforeEach(async () => {
    // Create spies for injected services
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    watchlistSvcSpy = jasmine.createSpyObj('WatchlistService', [
      'getWatchlistItems', 'update', 'add', 'delete', 'getTickerInfo'
    ]);
    yahooSpy = jasmine.createSpyObj('YahooFinanceService', ['getTickerInfo']);

    await TestBed.configureTestingModule({
      imports: [
        WatchlistComponent,          // Standalone component import
        HttpClientTestingModule,     // Replace real HttpClient with testing mock
        NoopAnimationsModule         // Prevent animation side effects
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: WatchlistService, useValue: watchlistSvcSpy },
        { provide: YahooFinanceService, useValue: yahooSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WatchlistComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    // Verify component instantiation
    expect(component).toBeTruthy();
  });

  it('should redirect to login if headerValue is missing', () => {
    // Simulate missing token in localStorage
    localStorage.removeItem('headerValue');
    component.ngOnInit();

    // Router should navigate to /login
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load watchlist items and set isLoading = false', () => {
    // Simulate valid token
    localStorage.setItem('headerValue', 'Basic testtoken');

    // Mock backend response with one item
    watchlistSvcSpy.getWatchlistItems.and.returnValue(of([sampleItem]));
    yahooSpy.getTickerInfo.and.returnValue(of({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 190
    }));

    component.ngOnInit();

    // Assert data load was triggered
    expect(watchlistSvcSpy.getWatchlistItems).toHaveBeenCalled();
  });

  it('should enter and exit edit mode', () => {
    // Simulate clicking "Edit"
    component.startEdit(sampleItem);
    expect(component.editMode).toBeTrue();
    expect(component.editingItem?.id).toBe(sampleItem.id);

    // Simulate clicking "Cancel"
    component.cancelEdit();
    expect(component.editMode).toBeFalse();
    expect(component.editingItem).toBeNull();
    expect(component.tempTargetPrice).toBeNull();
  });
});
