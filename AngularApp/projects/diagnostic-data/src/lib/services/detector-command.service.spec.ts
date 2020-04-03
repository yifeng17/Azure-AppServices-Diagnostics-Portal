import { TestBed } from '@angular/core/testing';

import { DetectorCommandService } from './detector-command.service';

describe('DetectorCommandService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DetectorCommandService = TestBed.get(DetectorCommandService);
    expect(service).toBeTruthy();
  });
});
