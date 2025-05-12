// =============================
// File: portfolio.service.spec.ts
// Description:
// Unit test suite for PortfolioService.
// Verifies service creation, HTTP requests with Authorization headers,
// and proper handling of different API responses for the portfolio functionality.
// =============================

import { TestBed } from '@angular/core/testing';
import { PortfolioService } from './portfolio.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Portfolio } from '../model/portfolio';
import { PortfolioOverview } from '../model/portfolio-overview';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Setup test environment and inject HttpClientTestingModule for HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(PortfolioService); // Inject the PortfolioService
    httpMock = TestBed.inject(HttpTestingController); // Inject HttpTestingController to mock requests
    localStorage.setItem('headerValue', 'Basic testtoken'); // Set a mock auth token in localStorage
  });

  afterEach(() => {
    // Ensure there are no pending HTTP requests after each test
    httpMock.verify();
    // Clean up localStorage
    localStorage.clear();
  });

  it('should be created', () => {
    // Verify that the service is instantiated properly
    expect(service).toBeTruthy();
  });

  it('should GET all portfolios with auth header', () => {
    const mockData: Portfolio[] = [{ id: 1, name: 'Test', createdAt: new Date() }];

    // Call the service method to fetch portfolios and check the response
    service.getPortfolios().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/portfolio');
    expect(req.request.method).toBe('GET'); // Verify it's a GET request
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken'); // Check the auth header
    req.flush(mockData); // Simulate response
  });

  it('should GET a portfolio by ID with auth header', () => {
    const mock: Portfolio = { id: 2, name: 'One', createdAt: new Date() };

    // Call the service method to fetch a portfolio by ID
    service.getPortfolio(2).subscribe(data => {
      expect(data).toEqual(mock);
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/portfolio/2');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken');
    req.flush(mock); // Simulate response
  });

  it('should POST to create a new portfolio with auth header', () => {
    const input: Portfolio = { id: 0, name: 'New', createdAt: new Date() };
    const mockResponse = { ...input, id: 100 };

    // Call the service method to create a portfolio
    service.createPortfolio(input).subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/portfolio');
    expect(req.request.method).toBe('POST'); // Verify it's a POST request
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken'); // Check the auth header
    expect(req.request.body).toEqual(input); // Verify the request body
    req.flush(mockResponse); // Simulate response
  });

  it('should DELETE a portfolio with auth header', () => {
    // Call the service method to delete a portfolio
    service.deletePortfolio(3).subscribe(response => {
      expect(response).toBeTruthy();
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/portfolio/3');
    expect(req.request.method).toBe('DELETE'); // Verify it's a DELETE request
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken');
    req.flush({ success: true }); // Simulate response
  });

  it('should GET all overviews with auth header', () => {
    const mockOverviews: PortfolioOverview[] = [{
      id: 1,
      name: 'Overview',
      currentValue: 5000,
      assetCount: 3,
      totalProfitLoss: 200,
      changePercent: 5,
      initialInvestment: 4800
    }];

    // Call the service method to fetch all portfolio overviews
    service.getAllOverviews().subscribe(data => {
      expect(data).toEqual(mockOverviews);
    });

    // Mock the HTTP request
    const req = httpMock.expectOne('http://localhost:5215/api/portfolio/overview');
    expect(req.request.method).toBe('GET'); // Verify it's a GET request
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken'); // Check the auth header
    req.flush(mockOverviews); // Simulate response
  });
});
