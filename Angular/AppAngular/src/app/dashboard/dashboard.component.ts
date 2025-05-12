// =============================
// File: dashboard.component.ts
// Description:
// Standalone component that displays a simple welcome dashboard.
// Retrieves and shows the currently logged-in username from the AuthService.
// Uses Angular Material and routing for navigation and styling.
// =============================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';   
import { AuthService } from '../services/auth.service'; 
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Uses Angular's standalone component approach
  
  imports: [
    CommonModule,     // For common directives like *ngIf
    RouterLink,       // Enables routerLink directive in template
    SharedModule      // Provides shared Material styles/components (e.g., mat-raised-button)
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Will hold the username after initialization
  username: string | null = null;

  constructor(private authService: AuthService) {}

  // On component init, retrieve the username from AuthService
  ngOnInit(): void {
    this.username = this.authService.getUsername();
  }
}
