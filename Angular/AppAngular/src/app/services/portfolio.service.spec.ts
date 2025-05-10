/**
 * PortfolioService Test Suite
 *
 * This test verifies:
 * 1. The service is created.
 * 2. Each method hits the correct endpoint with Authorization header.
 * 3. Responses are returned as expected.
 */

import { TestBed } from '@angular/core/testing';
import { PortfolioService } from './portfolio.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Portfolio } from '../model/portfolio';
import { PortfolioOverview } from '../model/portfolio-overview';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(PortfolioService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('headerValue', 'Basic testtoken');
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
    localStorage.clear(); // Clean up after each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET all portfolios with auth header', () => {
    const mockData: Portfolio[] = [{ id: 1, name: 'Test', createdAt: new Date() }];

    service.getPortfolios().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('http://localhost:5215/api/portfolio');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken');
    req.flush(mockData);
  });

  it('should GET a portfolio by ID with auth header', () => {
    const mock: Portfolio = { id: 2, name: 'One', createdAt: new Date() };

    service.getPortfolio(2).subscribe(data => {
      expect(data).toEqual(mock);
    });

    const req = httpMock.expectOne('http://localhost:5215/api/portfolio/2');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken');
    req.flush(mock);
  });

  it('should POST to create a new portfolio with auth header', () => {
    const input: Portfolio = { id: 0, name: 'New', createdAt: new Date() };
    const mockResponse = { ...input, id: 100 };

    service.createPortfolio(input).subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:5215/api/portfolio');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken');
    expect(req.request.body).toEqual(input);
    req.flush(mockResponse);
  });

  it('should DELETE a portfolio with auth header', () => {
    service.deletePortfolio(3).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:5215/api/portfolio/3');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken');
    req.flush({ success: true });
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

    service.getAllOverviews().subscribe(data => {
      expect(data).toEqual(mockOverviews);
    });

    const req = httpMock.expectOne('http://localhost:5215/api/portfolio/overview');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Basic testtoken');
    req.flush(mockOverviews);
  });
});
