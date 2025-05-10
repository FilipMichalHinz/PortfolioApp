/**
 * PortfolioFormComponent Test Suite
 * What this test does:
 * 1. Uses HttpClientTestingModule to satisfy HttpClient injection.
 * 2. Uses NoopAnimationsModule to avoid Angular Material animation errors.
 * 3. Confirms:
 *    - The component is created successfully.
 *    - Clicking Cancel emits 'cancelled' and resets the form.
 *    - Submitting with invalid input shows alert and does nothing.
 *    - Submitting with valid input calls the real URL and emits 'created'.
 */

import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { PortfolioFormComponent } from './portfolio-form.component';
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
        PortfolioFormComponent,         // standalone component
        HttpClientTestingModule,        // mock HttpClient to avoid injection errors
        NoopAnimationsModule            // prevent Material animation issues
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController); // used to mock HTTP calls
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit cancelled when onCancel is called', () => {
    spyOn(component.cancelled, 'emit');

    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
    expect(component.newPortfolio.name).toBe('');
  });

  it('should show alert and not call API if name is empty', () => {
  // Spy on alert BEFORE calling onSubmit
  const alertSpy = spyOn(window, 'alert');

  // Make the name invalid (whitespace only)
  component.newPortfolio.name = '   ';
  
  // Call the method
  component.onSubmit();

  // Alert should have been called
  expect(alertSpy).toHaveBeenCalledWith('Please fill in all required fields correctly.');

  // Confirm no HTTP request was made
  httpMock.expectNone('http://localhost:5215/api/portfolio');
});

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

    const req = httpMock.expectOne('http://localhost:5215/api/portfolio'); // FULL backend URL
    expect(req.request.method).toBe('POST');
    req.flush(response); // simulate success

    tick();

    expect(component.created.emit).toHaveBeenCalledWith(response);
    expect(component.newPortfolio.name).toBe('');
  }));
});
