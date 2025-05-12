// =============================
// File: portfolio-item.service.spec.ts
// Description:
// Unit test suite for PortfolioItemService.
// This test suite validates:
// 1. That the service is created properly.
// 2. All HTTP requests include the correct Authorization header and method.
// 3. Mock responses are correctly handled and returned.
// =============================

import { TestBed } from '@angular/core/testing';
import { PortfolioItemService } from './portfolio-item.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PortfolioItem } from '../model/portfolio-item';
import { PortfolioSummary } from '../model/portfolio-summary';

describe('PortfolioItemService', () => {
  let service: PortfolioItemService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Configures the testing module to use HttpClientTestingModule and inject the PortfolioItemService
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(PortfolioItemService); // Inject the PortfolioItemService
    httpMock = TestBed.inject(HttpTestingController); // Inject HttpTestingController to mock requests
    localStorage.setItem('headerValue', 'Basic faketoken'); // Mock auth token
  });

  afterEach(() => {
    // Verifies that no outstanding HTTP requests remain and clears localStorage after each test
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    // Verifies that the service is properly instantiated
    expect(service).toBeTruthy();
  });

  it('should GET items by portfolio', () => {
    const mockItems: PortfolioItem[] = [{ id: 1, name: 'AAPL', ticker: 'AAPL', quantity: 10, purchasePrice: 150, purchaseDate: '2023-01-01', portfolioId: 1 }];
    
    // Calls the service method to get items by portfolio and checks the response
    service.getByPortfolio(1).subscribe(data => {
      expect(data).toEqual(mockItems); // Expects the response to match mock data
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/asset/portfolios/1');
    expect(req.request.method).toBe('GET'); // Verifies that the request method is GET
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken'); // Verifies the Authorization header
    req.flush(mockItems); // Simulates the response with mock data
  });

  it('should POST a new item', () => {
    const item: PortfolioItem = {
      id: 0,
      name: 'MSFT',
      ticker: 'MSFT',
      quantity: 5,
      purchasePrice: 300,
      purchaseDate: '2023-01-10',
      portfolioId: 2
    };
    const created = { ...item, id: 101 };

    // Calls the service method to create a new portfolio item
    service.create(item).subscribe(data => {
      expect(data).toEqual(created); // Verifies that the created item matches the mock response
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/asset');
    expect(req.request.method).toBe('POST'); // Verifies that the request method is POST
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken'); // Verifies the Authorization header
    expect(req.request.body).toEqual(item); // Verifies that the request body matches the input item
    req.flush(created); // Simulates the response with the created item
  });

  it('should DELETE an item by ID', () => {
    // Calls the service method to delete a portfolio item
    service.delete(42).subscribe();

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/asset/42');
    expect(req.request.method).toBe('DELETE'); // Verifies that the request method is DELETE
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken'); // Verifies the Authorization header
    req.flush({}); // Simulates the response indicating successful deletion
  });

  it('should GET summary by portfolio ID', () => {
    const summary: PortfolioSummary = {
      portfolioId: 1,
      byAsset: [],
      initialInvestment: 0,
      currentValue: 0,
      totalProfitLoss: 0,
      changePercent: 0
    };

    // Calls the service method to get the portfolio summary
    service.getSummary(1).subscribe(data => {
      expect(data).toEqual(summary); // Verifies that the returned summary matches the mock data
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/asset/summary/1');
    expect(req.request.method).toBe('GET'); // Verifies that the request method is GET
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken'); // Verifies the Authorization header
    req.flush(summary); // Simulates the response with the portfolio summary
  });

  it('should PUT sell request', () => {
    const sellReq = { id: 5, exitPrice: 250, exitDate: '2024-01-01' };

    // Calls the service method to sell a portfolio item
    service.sellPortfolioItem(sellReq).subscribe();

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/asset/sell');
    expect(req.request.method).toBe('PUT'); // Verifies that the request method is PUT
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken'); // Verifies the Authorization header
    expect(req.request.body).toEqual(sellReq); // Verifies that the request body matches the sell request
    req.flush({}); // Simulates the response indicating the sell request was processed
  });

  it('should PUT update item', () => {
    const updated: PortfolioItem = {
      id: 7,
      name: 'Updated',
      ticker: 'UPD',
      quantity: 10,
      purchasePrice: 123,
      purchaseDate: '2023-11-01',
      portfolioId: 2
    };

    // Calls the service method to update a portfolio item
    service.update(updated).subscribe(data => {
      expect(data).toEqual(updated); // Verifies that the updated item matches the mock data
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/asset/update');
    expect(req.request.method).toBe('PUT'); // Verifies that the request method is PUT
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken'); // Verifies the Authorization header
    expect(req.request.body).toEqual(updated); // Verifies that the request body matches the updated item
    req.flush(updated); // Simulates the response with the updated item
  });
});
