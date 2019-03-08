import { TestBed } from '@angular/core/testing';

import { SolutionActionService } from './solution-action.service';

describe('SolutionActionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SolutionActionService = TestBed.get(SolutionActionService);
    expect(service).toBeTruthy();
  });
});
