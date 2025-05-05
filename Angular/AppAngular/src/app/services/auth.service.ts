import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    });
  }
}
