// =============================
// File: app.component.spec.ts
// Description:
// Defines the unit tests for the root component (AppComponent).
// Uses Angular's TestBed to configure and compile the standalone component for testing.
// Includes tests for component instantiation, property correctness, and DOM rendering.
// =============================

import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Standalone component is directly imported without declarations array
      imports: [AppComponent]
    }).compileComponents();
  });

  it('should create the app', () => {
    // Create component instance and verify it was instantiated
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'AppAngular' title`, () => {
    // Check that the title property matches the expected value
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('AppAngular');
  });

  it('should render title in the DOM', () => {
    // Trigger change detection and assert presence of title in rendered HTML
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, AppAngular');
  });
});
