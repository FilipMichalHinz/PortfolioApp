/**
 * PortfolioItemService Test Suite
 *
 * This test checks:
 * 1. The service is created successfully.
 * 2. Every method sends the correct request and includes the auth header.
 * 3. The correct mock data is returned.
 */

import { TestBed } from '@angular/core/testing';
import { PortfolioItemService } from './portfolio-item.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PortfolioItem } from '../model/portfolio-item';
import { PortfolioSummary } from '../model/portfolio-summary';

describe('PortfolioItemService', () => {
  let service: PortfolioItemService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(PortfolioItemService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('headerValue', 'Basic faketoken');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET items by portfolio', () => {
    const mockItems: PortfolioItem[] = [{ id: 1, name: 'AAPL', ticker: 'AAPL', quantity: 10, purchasePrice: 150, purchaseDate: '2023-01-01', portfolioId: 1 }];
    service.getByPortfolio(1).subscribe(data => {
      expect(data).toEqual(mockItems);
    });

    const req = httpMock.expectOne('http://localhost:5215/api/asset/portfolios/1');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken');
    req.flush(mockItems);
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

    service.create(item).subscribe(data => {
      expect(data).toEqual(created);
    });

    const req = httpMock.expectOne('http://localhost:5215/api/asset');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken');
    expect(req.request.body).toEqual(item);
    req.flush(created);
  });

  it('should DELETE an item by ID', () => {
    service.delete(42).subscribe();

    const req = httpMock.expectOne('http://localhost:5215/api/asset/42');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken');
    req.flush({});
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

    service.getSummary(1).subscribe(data => {
      expect(data).toEqual(summary);
    });

    const req = httpMock.expectOne('http://localhost:5215/api/asset/summary/1');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken');
    req.flush(summary);
  });

  it('should PUT sell request', () => {
    const sellReq = { id: 5, exitPrice: 250, exitDate: '2024-01-01' };

    service.sellPortfolioItem(sellReq).subscribe();

    const req = httpMock.expectOne('http://localhost:5215/api/asset/sell');
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken');
    expect(req.request.body).toEqual(sellReq);
    req.flush({});
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

    service.update(updated).subscribe(data => {
      expect(data).toEqual(updated);
    });

    const req = httpMock.expectOne('http://localhost:5215/api/asset/update');
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Basic faketoken');
    expect(req.request.body).toEqual(updated);
    req.flush(updated);
  });
});
