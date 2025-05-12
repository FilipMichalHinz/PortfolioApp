// =============================
// File: login.component.spec.ts
// Description:
// Unit test suite for LoginComponent.
// Validates authentication behavior, error handling, form validation,
// token storage, and navigation upon success.
// Uses Angular TestBed with spy-based service mocks and fakeAsync for async logic.
// =============================

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    // Create a spy object with a fake authenticate() method
    authSpy = jasmine.createSpyObj('AuthService', ['authenticate']);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,                     // Enables ngModel for two-way binding
        CommonModule,                    // Provides common directives like *ngIf
        RouterTestingModule.withRoutes([]), // Sets up Router stub
        LoginComponent                   // Standalone component under test
      ],
      providers: [
        { provide: AuthService, useValue: authSpy } // Inject spy instead of real service
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Clear token storage before each test
    localStorage.clear();

    // Initialize component bindings
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should alert and set loginFailed when username or password is empty', () => {
    component.username = '';
    component.password = '';

    spyOn(window, 'alert');
    component.login();

    expect(window.alert).toHaveBeenCalledWith('Bitte gib Benutzername und Passwort ein.');
    expect(component.loginFailed).toBeTrue();
  });

  it('should authenticate and navigate on successful login', fakeAsync(() => {
    // Fake backend response for successful login
    const fakeResponse = {
      userId: 1,
      username: 'alice',
      authHeader: 'Basic am9obi5kb2U6VmVyeVNlY3JldCE='
    };

    // Configure spy to return the response
    authSpy.authenticate.and.returnValue(of(fakeResponse));

    spyOn(window, 'alert');
    const navSpy = spyOn(router, 'navigate');

    component.username = 'alice';
    component.password = 'password';

    component.login();
    tick(); // Wait for async code

    expect(authSpy.authenticate).toHaveBeenCalledWith('alice', 'password');
    expect(localStorage.getItem('headerValue')).toBe(fakeResponse.authHeader);
    expect(component.loginFailed).toBeFalse();
    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should show error alert and set loginFailed on 401', fakeAsync(() => {
    authSpy.authenticate.and.returnValue(throwError({ status: 401 }));
    spyOn(window, 'alert');

    component.username = 'bad';
    component.password = 'creds';

    component.login();
    tick();

    expect(component.loginFailed).toBeTrue();
    expect(window.alert).toHaveBeenCalledWith('Falscher Benutzername oder Passwort.');
  }));

  it('should show connection error alert on status 0', fakeAsync(() => {
    authSpy.authenticate.and.returnValue(throwError({ status: 0 }));
    spyOn(window, 'alert');

    component.username = 'user';
    component.password = 'pass';

    component.login();
    tick();

    expect(component.loginFailed).toBeTrue();
    expect(window.alert).toHaveBeenCalledWith('Verbindung zum Server fehlgeschlagen.');
  }));

  it('should show generic error alert on other errors', fakeAsync(() => {
    authSpy.authenticate.and.returnValue(
      throwError({ status: 500, error: { message: 'Oops!' } })
    );
    spyOn(window, 'alert');

    component.username = 'user';
    component.password = 'pass';

    component.login();
    tick();

    expect(component.loginFailed).toBeTrue();
    expect(window.alert).toHaveBeenCalledWith('Ein Fehler ist aufgetreten: Oops!');
  }));
});
