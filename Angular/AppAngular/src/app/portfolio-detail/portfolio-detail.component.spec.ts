/**
 * PortfolioDetailComponent Test Suite
 *
 * This test covers:
 * 1. Component is created successfully.
 * 2. Redirect happens if the user is not logged in.
 * 3. Calling onItemCreated() hides form and reloads summary.
 */

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
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        PortfolioDetailComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => '1' }) // simulate route param id = 1
          }
        },
        {
          provide: PortfolioService,
          useValue: {
            getPortfolio: () => of({ id: 1, name: 'Test Portfolio', createdAt: new Date() })
          }
        },
        {
          provide: PortfolioItemService,
          useValue: {
            getSummary: () => of({ portfolioId: 1, byAsset: [], initialInvestment: 0, currentValue: 0, totalProfitLoss: 0, changePercent: 0 })
          }
        },
        {
          provide: YahooFinanceService,
          useValue: {
            getTickerInfo: () => of({ name: 'Test Co.' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to /login if token is missing', () => {
    localStorage.removeItem('headerValue');
    component.ngOnInit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should reload summary and hide form on item created', () => {
    const reloadSpy = spyOn(component as any, 'loadSummary');
    component.portfolio = { id: 1, name: 'Test', createdAt: new Date() };
    component.showForm = true;

    component.onItemCreated({} as any);

    expect(component.showForm).toBeFalse();
    expect(reloadSpy).toHaveBeenCalledWith(1);
  });
});
