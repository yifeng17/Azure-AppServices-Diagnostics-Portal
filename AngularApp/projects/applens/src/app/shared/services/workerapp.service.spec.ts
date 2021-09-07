import { TestBed, inject } from '@angular/core/testing';

import { WorkerAppService } from './workerapp.service';

describe('WorkerAppService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WorkerAppService]
    });
  });

  it('should be created', inject([WorkerAppService], (service: WorkerAppService) => {
    expect(service).toBeTruthy();
  }));
});
