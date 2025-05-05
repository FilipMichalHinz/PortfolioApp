import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

// Describe the test suite for AppComponent
describe('AppComponent', () => {

  // Setup test environment before each test
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent], // Using Standalone Component import
    }).compileComponents(); // Compile the component's template and styles
  });

  // Test case: The component should be created successfully
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy(); // Checks if instance is not null/undefined
  });

  // Test case: The component should have the correct title property
  it(`should have the 'AppAngular' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('AppAngular'); // Title should match the expected string
  });

  // Test case: The rendered HTML should contain the title inside an <h1> element
  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); // Trigger change detection to update DOM
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, AppAngular');
  });
});
