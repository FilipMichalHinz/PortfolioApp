// =============================
// File: yahoo-finance.service.spec.ts
// Description:
// Unit test suite for YahooFinanceService.
// Validates service creation, HTTP request to the correct endpoint,
// and correct parsing of the API response.
// Uses Angular's HttpClientTestingModule for isolation.
// =============================

import { TestBed } from '@angular/core/testing';
import { YahooFinanceService, YahooFinanceData } from './yahoo-finance.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('YahooFinanceService', () => {
  let service: YahooFinanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Configure test environment with HTTP testing module
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    // Inject service and mock HTTP controller
    service = TestBed.inject(YahooFinanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    // Verify service instantiation
    expect(service).toBeTruthy();
  });

  it('should fetch ticker info from the correct URL', () => {
    // Define a mock response as the backend would return it
    const mockResponse: YahooFinanceData = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.12
    };

    // Call the service method and expect the mock result
    service.getTickerInfo('AAPL').subscribe(data => {
      expect(data).toEqual(mockResponse); // Match expected shape and values
    });

    // Expect exactly one request to the specified endpoint
    const req = httpMock.expectOne('http://localhost:5215/api/yahoo?ticker=AAPL');
    expect(req.request.method).toBe('GET'); // Ensure correct HTTP verb

    // Simulate server sending the mock response
    req.flush(mockResponse);
  });

  afterEach(() => {
    // Ensure all HTTP requests were handled (no leaks or leftovers)
    httpMock.verify();
  });
});
