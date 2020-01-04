import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CXPChatService {
  
  constructor() {
    console.log('====================================================');
    console.log('CXPChatService created.');
  }

  public testMe(): string {
    return null;
  }

}
