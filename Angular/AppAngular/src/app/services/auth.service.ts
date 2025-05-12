// =============================
// File: auth.service.ts
// Description:
// Service for handling user authentication, including login, token storage, and logout.
// The service interacts with the backend API for login and stores the returned authentication token in localStorage.
// =============================

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Login } from '../model/login'; // Expected structure of login response

@Injectable({
  providedIn: 'root' // Makes the service available throughout the application
})
export class AuthService {
  // Base URL for the backend API
  baseUrl: string = "http://localhost:5215/api";

  constructor(private http: HttpClient) {}

  /**
   * Sends login credentials to the backend for authentication.
   * If successful, the backend returns an object containing an encoded authorization header.
   * The token and username are then stored in localStorage for subsequent authenticated requests.
   * @param username - The entered username
   * @param password - The entered password
   * @returns Observable<Login> - contains the authentication header (authHeader) and the username
   */
  authenticate(username: String, password: String): Observable<Login> {
    return this.http.post<Login>(`${this.baseUrl}/login`, {
      username: username,
      password: password
    }).pipe(
      tap(response => {
        if(response?.authHeader && response?.username) {
          // Store auth header and username in localStorage for future use
          localStorage.setItem('headerValue', response.authHeader); // Stores the authorization token
          localStorage.setItem('username', response.username); // Stores the username
        } else {
          this.clearAuthData(); // Clears any stored auth data if login fails
        }
      })
    );
  }

  /**
   * Retrieves the username from localStorage.
   * @returns string | null - returns the stored username, or null if not found
   */
  public getUsername(): string | null {
    return localStorage.getItem('username');
  }

  /**
   * Checks whether the user is authenticated based on the presence of an auth token in localStorage.
   * @returns boolean - true if the user is authenticated, false otherwise
   */
  public isAuthenticated(): boolean {
    return !!localStorage.getItem('headerValue'); // Returns true if authHeader exists
  }

  /**
   * Clears authentication-related data from localStorage.
   * This is called during logout or failed login attempts.
   */
  public clearAuthData(): void {
    localStorage.removeItem('headerValue'); // Removes the stored token
    localStorage.removeItem('username');    // Removes the stored username
  }
}
