import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService }    from '../services/auth.service';
import { Router }         from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule }    from '@angular/forms';
import { CommonModule }   from '@angular/common';
import { of, throwError } from 'rxjs';

/**
 *
 * When you run these tests:
 * 1. A fake AuthService and Router are provided to the component.
 * 2. The component is instantiated and localStorage is cleared.
 * 3. Tests run one by one to verify:
 *    - The component is created successfully.
 *    - Empty username or password shows an alert and sets loginFailed.
 *    - Successful login calls AuthService, stores headerValue, clears loginFailed, and navigates.
 *    - 401 error shows the correct “wrong credentials” alert.
 *    - Network error (status 0) shows the “connection failed” alert.
 *    - Other errors show a generic alert with the error message.
 */

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture:   ComponentFixture<LoginComponent>;
  let authSpy:   jasmine.SpyObj<AuthService>;
  let router:    Router;

  beforeEach(async () => {
    // Create a spy object for AuthService with only the method we need
    authSpy = jasmine.createSpyObj('AuthService', ['authenticate']);

    // Set up the testing module for LoginComponent
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,                  // provides ngModel for two-way binding
        CommonModule,                 // provides directives like *ngIf
        RouterTestingModule.withRoutes([]), // supplies a Router stub
        LoginComponent                // include the standalone component itself
      ],
      providers: [
        { provide: AuthService, useValue: authSpy }  // replace real AuthService with our spy
      ]
    }).compileComponents();

    // Get instances of Router and the component
    router  = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Make sure localStorage is empty before each test
    localStorage.clear();

    // Run change detection to initialize bindings
    fixture.detectChanges();
  });

  it('should create the component', () => {
    // Verify the component instance was created
    expect(component).toBeTruthy();
  });

  it('should alert and set loginFailed when username or password is empty', () => {
    // Simulate user leaving both fields blank
    component.username = '';
    component.password = '';

    // Spy on window.alert so we can verify it's called
    spyOn(window, 'alert');

    // Call the login() method
    component.login();

    // Expect an alert with the specific message
    expect(window.alert)
      .toHaveBeenCalledWith('Bitte gib Benutzername und Passwort ein.');
    // Expect the component to flag loginFailed = true
    expect(component.loginFailed).toBeTrue();
  });

  it('should authenticate and navigate on successful login', fakeAsync(() => {
    // Prepare a fake successful response from AuthService
    const fakeResponse = {
      userId:     1,
      username:   'alice',
      authHeader: 'Basic am9obi5kb2U6VmVyeVNlY3JldCE='
    };
    // Make the spy return an Observable of our fake response
    authSpy.authenticate.and.returnValue(of(fakeResponse));

    // Prevent unexpected alerts
    spyOn(window, 'alert');
    // Spy on router.navigate to confirm navigation
    const navSpy = spyOn(router, 'navigate');

    // Fill in valid credentials
    component.username = 'alice';
    component.password = 'password';

    // Trigger login and advance the async queue
    component.login();
    tick();

    // Verify AuthService.authenticate was called with correct args
    expect(authSpy.authenticate)
      .toHaveBeenCalledWith('alice', 'password');
    // Check that headerValue was stored in localStorage
    expect(localStorage.getItem('headerValue'))
      .toBe(fakeResponse.authHeader);
    // Confirm loginFailed was set to false
    expect(component.loginFailed).toBeFalse();
    // Verify navigation to the dashboard route
    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should show error alert and set loginFailed on 401', fakeAsync(() => {
    // Make the spy return a 401 error
    authSpy.authenticate.and.returnValue(
      throwError({ status: 401 })
    );
    spyOn(window, 'alert');

    // Provide bad credentials
    component.username = 'bad';
    component.password = 'creds';

    component.login();
    tick();

    // loginFailed should be true
    expect(component.loginFailed).toBeTrue();
    // Expect the specific "wrong credentials" alert
    expect(window.alert)
      .toHaveBeenCalledWith('Falscher Benutzername oder Passwort.');
  }));

  it('should show connection error alert on status 0', fakeAsync(() => {
    // Make the spy return a network error (status 0)
    authSpy.authenticate.and.returnValue(
      throwError({ status: 0 })
    );
    spyOn(window, 'alert');

    component.username = 'user';
    component.password = 'pass';

    component.login();
    tick();

    // loginFailed should be true
    expect(component.loginFailed).toBeTrue();
    // Expect the specific "connection failed" alert
    expect(window.alert)
      .toHaveBeenCalledWith('Verbindung zum Server fehlgeschlagen.');
  }));

  it('should show generic error alert on other errors', fakeAsync(() => {
    // Simulate a 500 error with a message payload
    authSpy.authenticate.and.returnValue(
      throwError({ status: 500, error: { message: 'Oops!' } })
    );
    spyOn(window, 'alert');

    component.username = 'user';
    component.password = 'pass';

    component.login();
    tick();

    // loginFailed should be true
    expect(component.loginFailed).toBeTrue();
    // Expect the generic error alert including the server message
    expect(window.alert)
      .toHaveBeenCalledWith('Ein Fehler ist aufgetreten: Oops!');
  }));
});
