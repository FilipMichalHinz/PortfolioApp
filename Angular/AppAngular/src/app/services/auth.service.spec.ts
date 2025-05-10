import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Login } from '../model/login';

/**
 * Unit tests for AuthService
 * 
 * We’ll verify:
 *  1. Service creation
 *  2. Successful login stores authHeader + username in localStorage
 *  3. Missing authHeader in response clears storage
 *  4. Error 401 is passed back to caller
 */
describe('AuthService', () => {
  let service: AuthService;             // the service under test
  let httpMock: HttpTestingController;  // lets us mock HTTP requests
  const baseUrl = 'http://localhost:5215/api';

  beforeEach(() => {
    //Set up Angular’s testing module–just like AppModule but with a fake HTTP backend
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    //Grab instances of AuthService and HttpTestingController
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    //Start with no leftover data in localStorage
    localStorage.clear();
  });

  afterEach(() => {
    //Verify that no HTTP calls are left hanging after each test
    httpMock.verify();
  });

  it('should be created', () => {
    // Basic sanity check that the service can be instantiated
    expect(service).toBeTruthy();
  });

  it('should store headerValue & username on successful login', (done) => {
    // Prepare a fake successful response from the backend
    const mockResponse: Login = {
      userId:     1,
      username:   'alice',
      authHeader: 'Basic am9obi5kb2U6VmVyeVNlY3JldCE='
    };

    // Call authenticate(); the tap() in the service should write to localStorage
    service.authenticate('alice', 'password').subscribe(response => {
      // Check that the response matches our mock
      expect(response.authHeader).toBe(mockResponse.authHeader);

      // And that localStorage now contains the correct values
      expect(localStorage.getItem('headerValue')).toBe(mockResponse.authHeader);
      expect(localStorage.getItem('username')).toBe('alice');
      done();
    });

    // Expect exactly one HTTP POST to /api/login with the right body…
    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'alice',
      password: 'password'
    });

    // then flush our mock response so the Observable resolves
    req.flush(mockResponse);
  });

  it('should clear storage if response has no authHeader', (done) => {
    // Pre-fill localStorage to see it get removed
    localStorage.setItem('headerValue', 'foo');
    localStorage.setItem('username', 'bar');

    // Call authenticate() with a response that has no authHeader
    service.authenticate('john.doe', 'Whatever').subscribe(response => {
      // 3Because response.authHeader is undefined, clearAuthData() should run
      expect(localStorage.getItem('headerValue')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      done();
    });

    // Fake the HTTP call returning an empty object
    const req = httpMock.expectOne(`${baseUrl}/login`);
    req.flush({} as any);
  });

  it('should propagate a 401 error for bad credentials', (done) => {
    // Attempt login with wrong credentials
    service.authenticate('wrong', 'password').subscribe({
      next: () => fail('Expected an error, but got a success'),
      error: err => {
        // 2We expect a 401 Unauthorized status
        expect(err.status).toBe(401);
        done();
      }
    });

    // Fake the HTTP call returning a 401
    const req = httpMock.expectOne(`${baseUrl}/login`);
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });
});
