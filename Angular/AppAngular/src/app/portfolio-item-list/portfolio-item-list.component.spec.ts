import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioItemListComponent } from './portfolio-item-list.component';

describe('PortfolioItemListComponent', () => {
  let component: PortfolioItemListComponent;
  let fixture: ComponentFixture<PortfolioItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioItemListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PortfolioItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
