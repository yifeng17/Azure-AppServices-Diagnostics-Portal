import { TestBed } from '@angular/core/testing';

import { DynamicAnalysisService } from './dynamic-analysis.service';

describe('DynamicAnalysisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicAnalysisService = TestBed.get(DynamicAnalysisService);
    expect(service).toBeTruthy();
  });
});
