import { TestBed } from '@angular/core/testing';

import { DesignationsService } from './designations.service';

describe('DesignationsService', () => {
  let service: DesignationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesignationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
