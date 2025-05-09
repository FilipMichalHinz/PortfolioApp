import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Login } from '../model/login';

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
   * @param username - The entered username
   * @param password - The entered password
   * @returns Observable<Login> - contains headerValue (e.g., "Basic xxxxx")
   */
  authenticate(username: String, password: String): Observable<Login> {
    return this.http.post<Login>(`${this.baseUrl}/login`, {
      username: username,
      password: password
    }).pipe(
      tap(response => {
        if(response?.authHeader && response?.username) {
          localStorage.setItem('headerValue', response.authHeader); // Store the auth header in local storage
          localStorage.setItem('username', response.username); // Store the username in local storage
        } else {
          this.clearAuthData();
        }
      })
    );
  }

  public getUsername(): string | null {
    return localStorage.getItem('username');
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('headerValue');
  }

  public clearAuthData(): void {
    localStorage.removeItem('headerValue');
    localStorage.removeItem('username');
    
  }


}
