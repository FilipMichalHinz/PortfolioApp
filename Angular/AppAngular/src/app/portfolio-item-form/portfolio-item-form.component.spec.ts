// =============================
// File: portfolio-form.component.spec.ts
// Description:
// Unit test suite for the PortfolioFormComponent.
// Verifies component creation, form validation behavior, cancel/reset logic,
// and proper HTTP integration via mocked requests.
// Utilizes Angular testing utilities and mocks to isolate component behavior.
// =============================

import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { PortfolioFormComponent } from '../portfolio-form/portfolio-form.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Portfolio } from '../model/portfolio';

describe('PortfolioFormComponent', () => {
  let component: PortfolioFormComponent;
  let fixture: ComponentFixture<PortfolioFormComponent>;
  let httpMock: HttpTestingController;

  // =============================
  // Setup Test Environment
  // - Configures test module with dependencies
  // - Instantiates component and injects HTTP mock
  // =============================
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PortfolioFormComponent,         // Standalone component under test
        HttpClientTestingModule,        // Mocks HttpClient to avoid real HTTP calls
        NoopAnimationsModule            // Prevents Angular Material animation issues
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController); // Used to mock HTTP calls
    fixture.detectChanges();
  });

  // =============================
  // Test: Component Creation
  // Verifies that the component instantiates correctly.
  // =============================
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // =============================
  // Test: Cancel Action
  // - Calls component.onCancel()
  // - Expects cancellation event to be emitted
  // - Verifies form is reset
  // =============================
  it('should emit cancelled when onCancel is called', () => {
    spyOn(component.cancelled, 'emit');

    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
    expect(component.newPortfolio.name).toBe('');
  });

  // =============================
  // Test: Invalid Submission
  // - Provides invalid (blank) name input
  // - Expects alert to be shown
  // - Expects no HTTP call to be made
  // =============================
  it('should show alert and not call API if name is empty', () => {
    spyOn(window, 'alert');

    component.newPortfolio.name = '   '; // whitespace = invalid
    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields correctly.');
    httpMock.expectNone('http://localhost:5215/api/portfolio');
  });

  // =============================
  // Test: Valid Submission
  // - Fills valid portfolio data
  // - Simulates successful HTTP response
  // - Verifies POST request and event emission
  // =============================
  it('should POST to real backend URL and emit created on valid form', fakeAsync(() => {
    const valid: Portfolio = {
      id: 0,
      name: 'Valid Portfolio',
      createdAt: new Date()
    };

    const response: Portfolio = { ...valid, id: 99 };

    spyOn(component.created, 'emit');
    component.newPortfolio = { ...valid };

    component.onSubmit();

    const req = httpMock.expectOne('http://localhost:5215/api/portfolio');
    expect(req.request.method).toBe('POST');
    req.flush(response); // Simulate HTTP response

    tick(); // Resolve observable

    expect(component.created.emit).toHaveBeenCalledWith(response);
    expect(component.newPortfolio.name).toBe(''); // Form reset after success
  }));
});
