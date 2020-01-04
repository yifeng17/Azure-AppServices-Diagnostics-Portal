import { TestBed } from '@angular/core/testing';

import { CXPChatService } from './cxp-chat.service';

describe('CXPChatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CXPChatService = TestBed.get(CXPChatService);
    expect(service).toBeTruthy();
  });
});
