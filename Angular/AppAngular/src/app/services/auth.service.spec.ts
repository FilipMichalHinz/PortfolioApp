// =============================
// File: auth.service.spec.ts
// Description:
// Unit test suite for AuthService.
// Verifies service creation, login behavior, localStorage handling,
// and error propagation for failed login attempts.
// Uses Angular's HttpClientTestingModule to mock HTTP communication.
// =============================

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Login } from '../model/login';

describe('AuthService', () => {
  let service: AuthService;             // The service under test
  let httpMock: HttpTestingController;  // Mock controller for HTTP requests
  const baseUrl = 'http://localhost:5215/api'; // Base API URL

  beforeEach(() => {
    // Set up Angular's testing module with mocked HTTP backend
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    // Inject instances of AuthService and HttpTestingController
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Ensure localStorage is clean before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Verify that there are no outstanding HTTP requests
    httpMock.verify();
  });

  it('should be created', () => {
    // Basic sanity check that the service can be instantiated
    expect(service).toBeTruthy();
  });

  it('should store headerValue & username on successful login', (done) => {
    // Simulated backend response for valid login
    const mockResponse: Login = {
      userId:     1,
      username:   'alice',
      authHeader: 'Basic am9obi5kb2U6VmVyeVNlY3JldCE='
    };

    // Call authenticate and verify that data is written to localStorage
    service.authenticate('alice', 'password').subscribe(response => {
      expect(response.authHeader).toBe(mockResponse.authHeader);
      expect(localStorage.getItem('headerValue')).toBe(mockResponse.authHeader);
      expect(localStorage.getItem('username')).toBe('alice');
      done(); // Signal test completion
    });

    // Expect a single POST request to the login endpoint with the correct payload
    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'alice',
      password: 'password'
    });

    // Simulate server response
    req.flush(mockResponse);
  });

  it('should clear storage if response has no authHeader', (done) => {
    // Pre-fill localStorage to verify clearing
    localStorage.setItem('headerValue', 'foo');
    localStorage.setItem('username', 'bar');

    // Call authenticate with an invalid response (missing authHeader)
    service.authenticate('john.doe', 'Whatever').subscribe(() => {
      // The service should clear stored credentials
      expect(localStorage.getItem('headerValue')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      done();
    });

    // Respond with an empty object simulating a failed backend auth
    const req = httpMock.expectOne(`${baseUrl}/login`);
    req.flush({} as any);
  });

  it('should propagate a 401 error for bad credentials', (done) => {
    // Call authenticate with incorrect credentials
    service.authenticate('wrong', 'password').subscribe({
      next: () => fail('Expected an error, but got a success'),
      error: err => {
        // Check that the error has the expected status code
        expect(err.status).toBe(401);
        done();
      }
    });

    // Simulate a 401 Unauthorized error from the backend
    const req = httpMock.expectOne(`${baseUrl}/login`);
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });
});
