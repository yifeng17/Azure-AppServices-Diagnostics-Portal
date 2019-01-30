import { TestBed } from '@angular/core/testing';

import { LocalBackendService } from './local-backend.service';

describe('LocalBackendService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalBackendService = TestBed.get(LocalBackendService);
    expect(service).toBeTruthy();
  });
});
