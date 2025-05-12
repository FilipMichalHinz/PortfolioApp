// =============================
// File: portfolio-detail.component.spec.ts
// Description:
// Unit test suite for PortfolioDetailComponent.
// Verifies component initialization, authentication redirect behavior,
// and the behavior of the onItemCreated() method.
// Uses Angular testing utilities and mock services for full isolation.
// =============================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioDetailComponent } from './portfolio-detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PortfolioService } from '../services/portfolio.service';
import { PortfolioItemService } from '../services/portfolio-item.service';
import { YahooFinanceService } from '../services/yahoo-finance.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PortfolioDetailComponent (Simple)', () => {
  let component: PortfolioDetailComponent;
  let fixture: ComponentFixture<PortfolioDetailComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create a spy for Router to intercept navigation
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        PortfolioDetailComponent,     // Standalone component under test
        HttpClientTestingModule,     // Provide mock HttpClient
        NoopAnimationsModule         // Disable animations for test stability
      ],
      providers: [
        // Provide the mocked Router with a spy for redirection assertions
        { provide: Router, useValue: routerSpy },

        // Mock ActivatedRoute to simulate a route param (id = 1)
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => '1' })
          }
        },

        // Provide a mock PortfolioService that returns a test portfolio
        {
          provide: PortfolioService,
          useValue: {
            getPortfolio: () => of({ id: 1, name: 'Test Portfolio', createdAt: new Date() })
          }
        },

        // Provide a mock PortfolioItemService with a basic summary response
        {
          provide: PortfolioItemService,
          useValue: {
            getSummary: () => of({
              portfolioId: 1,
              byAsset: [],
              initialInvestment: 0,
              currentValue: 0,
              totalProfitLoss: 0,
              changePercent: 0
            })
          }
        },

        // Provide a mock YahooFinanceService with basic ticker info
        {
          provide: YahooFinanceService,
          useValue: {
            getTickerInfo: () => of({ name: 'Test Co.' })
          }
        }
      ]
    }).compileComponents();

    // Create the component and trigger lifecycle hooks
    fixture = TestBed.createComponent(PortfolioDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Verifies that the component initializes without crashing
    expect(component).toBeTruthy();
  });

  it('should redirect to /login if token is missing', () => {
    // Remove login token to simulate unauthenticated state
    localStorage.removeItem('headerValue');

    // Manually trigger ngOnInit
    component.ngOnInit();

    // Expect a redirect to the login page
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should reload summary and hide form on item created', () => {
    // Spy on loadSummary method to verify it is called
    const reloadSpy = spyOn(component as any, 'loadSummary');

    // Set required preconditions
    component.portfolio = { id: 1, name: 'Test', createdAt: new Date() };
    component.showForm = true;

    // Trigger the event handler
    component.onItemCreated({} as any);

    // Form should be hidden and summary reloaded
    expect(component.showForm).toBeFalse();
    expect(reloadSpy).toHaveBeenCalledWith(1);
  });
});
