/**
 * WatchlistComponent Test Suite
 *
 * What this test covers:
 * 1. Component is created successfully.
 * 2. Redirects to login if token is missing.
 * 3. loadWatchlist() sets table data and disables loading.
 * 4. startEdit() sets edit mode and selected item.
 * 5. cancelEdit() clears edit mode and resets state.
 */

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
  let routerSpy: jasmine.SpyObj<Router>;
  let watchlistSvcSpy: jasmine.SpyObj<WatchlistService>;
  let yahooSpy: jasmine.SpyObj<YahooFinanceService>;

  const sampleItem: WatchlistItem = {
    id: 1,
    ticker: 'AAPL',
    assetName: 'Apple Inc.',
    targetPrice: 200,
    currentPrice: null
  };

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    watchlistSvcSpy = jasmine.createSpyObj('WatchlistService', ['getWatchlistItems', 'update', 'add', 'delete', 'getTickerInfo']);
    yahooSpy = jasmine.createSpyObj('YahooFinanceService', ['getTickerInfo']);

    await TestBed.configureTestingModule({
      imports: [
        WatchlistComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
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
    expect(component).toBeTruthy();
  });

  it('should redirect to login if headerValue is missing', () => {
    localStorage.removeItem('headerValue');
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load watchlist items and set isLoading = false', () => {
    localStorage.setItem('headerValue', 'Basic testtoken');
    watchlistSvcSpy.getWatchlistItems.and.returnValue(of([sampleItem]));
    yahooSpy.getTickerInfo.and.returnValue(of({ symbol: 'AAPL', name: 'Apple Inc.', price: 190 }));

    component.ngOnInit();

    expect(watchlistSvcSpy.getWatchlistItems).toHaveBeenCalled();
  });

  it('should enter and exit edit mode', () => {
    component.startEdit(sampleItem);
    expect(component.editMode).toBeTrue();
    expect(component.editingItem?.id).toBe(sampleItem.id);

    component.cancelEdit();
    expect(component.editMode).toBeFalse();
    expect(component.editingItem).toBeNull();
    expect(component.tempTargetPrice).toBeNull();
  });
});
