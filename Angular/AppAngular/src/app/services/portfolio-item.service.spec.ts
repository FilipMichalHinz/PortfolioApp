import { TestBed } from '@angular/core/testing';

import { PortfolioItemService } from './portfolio-item.service';

describe('PortfolioItemService', () => {
  let service: PortfolioItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
