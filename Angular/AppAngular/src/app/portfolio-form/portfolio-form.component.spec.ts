// =============================
// File: portfolio-form.component.spec.ts
// Description:
// Unit test suite for the PortfolioFormComponent.
// Validates component creation, form input behavior, submission logic,
// and proper HTTP request handling using Angular’s testing tools.
// Confirms that user actions (cancel, submit) trigger appropriate events.
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PortfolioFormComponent,      // Component under test (standalone)
        HttpClientTestingModule,     // Mocks HttpClient for backend communication
        NoopAnimationsModule         // Disables animations to ensure test stability
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController); // Used to intercept HTTP requests
    fixture.detectChanges(); // Triggers initial data binding
  });

  it('should create the component', () => {
    // Verifies that the component initializes without errors
    expect(component).toBeTruthy();
  });

  it('should emit "cancelled" and reset the form when onCancel() is called', () => {
    spyOn(component.cancelled, 'emit');

    component.onCancel(); // Triggers cancel logic

    expect(component.cancelled.emit).toHaveBeenCalled(); // Event was emitted
    expect(component.newPortfolio.name).toBe('');        // Form was reset
  });

  it('should show alert and prevent submission if portfolio name is empty or whitespace', () => {
    spyOn(window, 'alert');

    component.newPortfolio.name = '   '; // Simulate invalid input
    component.onSubmit();                // Attempt to submit

    expect(window.alert).toHaveBeenCalledWith(
      'Please fill in all required fields correctly.'
    );
    httpMock.expectNone('http://localhost:5215/api/portfolio'); // Ensure no API call
  });

  it('should submit valid portfolio and emit "created" on success', fakeAsync(() => {
    const valid: Portfolio = {
      id: 0,
      name: 'Valid Portfolio',
      createdAt: new Date()
    };

    const response: Portfolio = { ...valid, id: 99 };

    spyOn(component.created, 'emit');
    component.newPortfolio = { ...valid }; // Populate form with valid data

    component.onSubmit(); // Submit the form

    const req = httpMock.expectOne('http://localhost:5215/api/portfolio');
    expect(req.request.method).toBe('POST'); // Ensure it's a POST request

    req.flush(response); // Simulate a successful backend response
    tick(); // Resolve async operations

    expect(component.created.emit).toHaveBeenCalledWith(response); // Event emitted
    expect(component.newPortfolio.name).toBe(''); // Form reset after success
  }));
});
