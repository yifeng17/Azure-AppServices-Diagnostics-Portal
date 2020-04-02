import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DetectorCommandService {
  
  private _refresh: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor() {
  }

  public get update() {
    return this._refresh;
  }

  public resetRefresBehaviorSubject() {
    console.log("In detectorCommandService, reset _refresh to be false");
    this._refresh = new BehaviorSubject<boolean>(false);
  }

  public refesh() {
     this._refresh.next(true);
   }
}
