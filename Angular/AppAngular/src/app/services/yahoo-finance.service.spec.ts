/**
 * YahooFinanceService Test Suite
 *
 * This test verifies:
 * 1. The service can be created.
 * 2. getTickerInfo() sends an HTTP GET to the correct URL.
 * 3. It returns the expected data.
 */

import { TestBed } from '@angular/core/testing';
import { YahooFinanceService, YahooFinanceData } from './yahoo-finance.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('YahooFinanceService', () => {
  let service: YahooFinanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(YahooFinanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch ticker info from the correct URL', () => {
    const mockResponse: YahooFinanceData = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.12
    };

    service.getTickerInfo('AAPL').subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:5215/api/yahoo?ticker=AAPL');
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse); // Simulate backend response
  });

  afterEach(() => {
    httpMock.verify(); // Make sure there are no outstanding requests
  });
});
