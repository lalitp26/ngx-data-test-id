import { TestBed } from '@angular/core/testing';

import { DataTestIdService } from './data-test-id.service';

describe('DataTestIdService', () => {
  let service: DataTestIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataTestIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
