import { TestBed } from '@angular/core/testing';

import { GenericSolutionService } from './generic-solution.service';

describe('GenericSolutionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GenericSolutionService = TestBed.get(GenericSolutionService);
    expect(service).toBeTruthy();
  });
});
