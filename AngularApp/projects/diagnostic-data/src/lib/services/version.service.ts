import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private useLegcy: boolean;
  private subId:string;
  public isLegacySub:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  
  constructor() {}
}
