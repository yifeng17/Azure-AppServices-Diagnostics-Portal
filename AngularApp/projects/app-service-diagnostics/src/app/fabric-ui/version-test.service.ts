import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VersioningHelper } from '../shared/utilities/versioningHelper';
import { DemoSubscriptions } from '../betaSubscriptions';

@Injectable()
export class VersionTestService {
  private useLegcy: boolean;
  constructor(private _activatedRoute: ActivatedRoute) {
    const subscriptionId: string = this._activatedRoute.root.firstChild.firstChild.snapshot.params['subscriptionid'];
    // this.useLegcy = VersioningHelper.isV2Subscription(subId);
    this.useLegcy = DemoSubscriptions.betaSubscriptions.findIndex(item => subscriptionId.toLowerCase() === item.toLowerCase()) > -1;
  }
  public getIsLegcy() {
    return this.useLegcy;
  }
}
