// =============================
// File: portfolio-list.component.spec.ts
// Description:
// Contains unit tests for the PortfolioListComponent.
// Verifies component creation, authentication logic, data loading with totals calculation,
// handling of deletion from the list, and response to portfolio creation events.
// Uses Jasmine spies and Angular's TestBed for isolation and mocking.
// =============================

import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { PortfolioListComponent } from './portfolio-list.component';
import { PortfolioService } from '../services/portfolio.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PortfolioOverview } from '../model/portfolio-overview';
import { Portfolio } from '../model/portfolio';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PortfolioListComponent', () => {
  let component: PortfolioListComponent;
  let fixture: ComponentFixture<PortfolioListComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let serviceSpy: jasmine.SpyObj<PortfolioService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    serviceSpy = jasmine.createSpyObj('PortfolioService', ['getAllOverviews']);

    await TestBed.configureTestingModule({
      imports: [
        PortfolioListComponent,      // Standalone component under test
        HttpClientTestingModule,     // Mocks HttpClient
        NoopAnimationsModule         // Prevents animation-related issues
      ],
      providers: [
        { provide: PortfolioService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to /login if no token found', () => {
    // Simulate missing authentication token
    localStorage.removeItem('headerValue');

    component.ngOnInit();

    // Router should redirect to login
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load overviews and update totals', fakeAsync(() => {
    const sampleData: PortfolioOverview[] = [
      {
        id: 1, name: 'P1', initialInvestment: 1000, currentValue: 1100,
        assetCount: 2, totalProfitLoss: 100, changePercent: 10
      },
      {
        id: 2, name: 'P2', initialInvestment: 2000, currentValue: 1800,
        assetCount: 3, totalProfitLoss: -200, changePercent: -10
      }
    ];

    // Prevent redirect by setting a token
    localStorage.setItem('headerValue', 'test');

    // Mock backend response
    serviceSpy.getAllOverviews.and.returnValue(of(sampleData));

    component.ngOnInit();  // Automatically calls loadOverviews
    tick();                // Complete observables

    expect(component.portfolios.length).toBe(2);
    expect(component.totalPortfolioCount).toBe(2);
    expect(component.totalPortfolioValue).toBe(2900);    // 1100 + 1800
    expect(component.totalProfitLoss).toBe(-100);        // 100 - 200
    expect(component.isLoading).toBeFalse();
  }));

  it('should remove a portfolio from the list when deleted', () => {
    component.portfolios = [
      {
        id: 1, name: 'A', initialInvestment: 100, currentValue: 120,
        assetCount: 1, totalProfitLoss: 20, changePercent: 20
      },
      {
        id: 2, name: 'B', initialInvestment: 100, currentValue: 100,
        assetCount: 2, totalProfitLoss: 0, changePercent: 0
      }
    ];

    component.onPortfolioDeleted(1);

    expect(component.portfolios.length).toBe(1);
    expect(component.portfolios[0].id).toBe(2);
  });

  it('should reload overviews and hide form when portfolio is created', fakeAsync(() => {
    spyOn(component, 'loadOverviews');
    component.showAddPortfolioForm = true;

    const newPortfolio: Portfolio = {
      id: 3,
      name: 'New',
      createdAt: new Date()
    };

    component.onPortfolioCreated(newPortfolio);
    tick(); // Simulate passage of time

    expect(component.loadOverviews).toHaveBeenCalled();
    expect(component.showAddPortfolioForm).toBeFalse();
  }));
});
