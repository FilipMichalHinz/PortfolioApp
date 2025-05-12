// =============================
// File: dashboard.component.spec.ts
// Description:
// Basic unit test suite for DashboardComponent.
// Verifies that the component can be instantiated successfully
// using Angular's TestBed with standalone component support.
// =============================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    // Configure test module with the standalone DashboardComponent
    await TestBed.configureTestingModule({
      imports: [DashboardComponent] // Standalone component included directly
    }).compileComponents();

    // Create component instance and run initial lifecycle hooks
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Triggers ngOnInit()
  });

  it('should create', () => {
    // Verify that the component initializes without errors
    expect(component).toBeTruthy();
  });
});
