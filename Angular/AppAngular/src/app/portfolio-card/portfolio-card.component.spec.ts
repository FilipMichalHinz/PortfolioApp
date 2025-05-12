// =============================
// File: portfolio-card.component.spec.ts
// Description:
// Unit test suite for PortfolioCardComponent.
// Validates rendering, deletion behavior, event emission, and interaction with the service.
// Ensures cancel confirmation prevents deletion and success confirmation triggers full logic.
// =============================

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

  // Sample portfolio input for the tests
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
    // Create a spy for the PortfolioService
    serviceSpy = jasmine.createSpyObj('PortfolioService', ['deletePortfolio']);

    await TestBed.configureTestingModule({
      imports: [
        PortfolioCardComponent,         // Component under test (standalone)
        HttpClientTestingModule,       // Required for service injection
        NoopAnimationsModule           // Avoid Angular Material animation errors
      ],
      providers: [
        { provide: PortfolioService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioCardComponent);
    component = fixture.componentInstance;
    component.portfolio = samplePortfolio; // Provide test data
    fixture.detectChanges(); // Trigger Angular lifecycle
  });

  it('should create the component', () => {
    // Basic creation test
    expect(component).toBeTruthy();
  });

  it('should display the portfolio name', () => {
    // Verifies portfolio name is rendered in .header
    const header = fixture.nativeElement.querySelector('.header');
    expect(header.textContent).toContain('Test Portfolio');
  });

  it('should NOT call deletePortfolio or emit if user cancels', () => {
    // Simulate user cancelling confirmation dialog
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(component.deleted, 'emit');

    const fakeEvent = new Event('click');
    component.confirmDelete(fakeEvent);

    // Ensure no backend call or event emitted
    expect(serviceSpy.deletePortfolio).not.toHaveBeenCalled();
    expect(component.deleted.emit).not.toHaveBeenCalled();
  });

  it('should call deletePortfolio and emit deleted if confirmed', fakeAsync(() => {
    // Simulate user confirming the delete dialog
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.deleted, 'emit');

    // Configure service to return successful observable
    serviceSpy.deletePortfolio.and.returnValue(of(void 0));

    const fakeEvent = new Event('click');
    component.confirmDelete(fakeEvent);

    // Wait for observable to resolve
    tick();
    fixture.detectChanges();

    // Ensure UI was reset and events/service triggered correctly
    expect(component.isDeleting).toBeFalse();
    expect(serviceSpy.deletePortfolio).toHaveBeenCalledWith(1);
    expect(component.deleted.emit).toHaveBeenCalledWith(1);
  }));
});
