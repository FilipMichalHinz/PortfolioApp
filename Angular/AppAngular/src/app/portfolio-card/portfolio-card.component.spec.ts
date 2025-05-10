/**
 * PortfolioCardComponent Test Suite
 *
 * This test checks:
 * 1. Component renders successfully.
 * 2. It displays the portfolio name.
 * 3. confirmDelete() does nothing when user cancels.
 * 4. confirmDelete() calls service and emits deleted when confirmed.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PortfolioCardComponent } from './portfolio-card.component';
import { PortfolioService } from '../services/portfolio.service';
import { PortfolioOverview } from '../model/portfolio-overview';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PortfolioCardComponent', () => {
  let component: PortfolioCardComponent;
  let fixture: ComponentFixture<PortfolioCardComponent>;
  let serviceSpy: jasmine.SpyObj<PortfolioService>;

  const samplePortfolio: PortfolioOverview = {
    id: 1,
    name: 'Test Portfolio',
    currentValue: 5000,
    assetCount: 4,
    totalProfitLoss: -200,
    changePercent: -4,
    initialInvestment: 5000
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('PortfolioService', ['deletePortfolio']);

    await TestBed.configureTestingModule({
      imports: [
        PortfolioCardComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PortfolioService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioCardComponent);
    component = fixture.componentInstance;
    component.portfolio = samplePortfolio;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the portfolio name', () => {
    const header = fixture.nativeElement.querySelector('.header');
    expect(header.textContent).toContain('Test Portfolio');
  });

  it('should NOT call deletePortfolio or emit if user cancels', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component.deleted, 'emit');

    const fakeEvent = new Event('click');
    component.confirmDelete(fakeEvent);

    expect(serviceSpy.deletePortfolio).not.toHaveBeenCalled();
    expect(component.deleted.emit).not.toHaveBeenCalled();
  });

  it('should call deletePortfolio and emit deleted if confirmed', fakeAsync(() => {
  spyOn(window, 'confirm').and.returnValue(true);
  spyOn(component.deleted, 'emit');
  serviceSpy.deletePortfolio.and.returnValue(of(void 0));

  const fakeEvent = new Event('click');
  component.confirmDelete(fakeEvent);

  tick(); // ← allow async observable to complete BEFORE making assertions
  fixture.detectChanges();

  expect(component.isDeleting).toBeFalse(); // already reset after async call
  expect(serviceSpy.deletePortfolio).toHaveBeenCalledWith(1);
  expect(component.deleted.emit).toHaveBeenCalledWith(1);
}));
});
