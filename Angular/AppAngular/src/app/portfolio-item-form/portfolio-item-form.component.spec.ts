import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioItemFormComponent } from './portfolio-item-form.component';

describe('PortfolioItemFormComponent', () => {
  let component: PortfolioItemFormComponent;
  let fixture: ComponentFixture<PortfolioItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioItemFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PortfolioItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
