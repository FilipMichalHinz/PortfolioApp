import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'AppAngular';
  isLoggedIn = false;
  isLoginPage = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Re-evaluate on every route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const token = localStorage.getItem('headerValue');
        this.isLoggedIn = !!token;
        this.isLoginPage = this.router.url === '/login';
      });
  }

  logout(): void {
    localStorage.removeItem('headerValue');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}
