import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'}) 
export class Globals {
  constructor() { }
  messages: any[] = [];
  openGeniePanel: boolean = true;
  openFeedback: boolean = false;
  messagesData: { [id: string]: any } = {};
}
