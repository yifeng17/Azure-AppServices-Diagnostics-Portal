import { TestBed } from '@angular/core/testing';

import { CXPChatCallerService } from './cxp-chat-caller.service';

describe('CXPChatCallerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CXPChatCallerService = TestBed.get(CXPChatCallerService);
    expect(service).toBeTruthy();
  });
});
