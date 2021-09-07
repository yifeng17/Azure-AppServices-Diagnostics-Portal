import { BehaviorSubject, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { RESOURCE_SERVICE_INPUTS, ResourceServiceInputs } from '../models/resources';
import { ObserverService } from './observer.service';
import { ResourceService } from './resource.service';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class WorkerAppService extends ResourceService {

  private _currentResource: BehaviorSubject<Observer.ObserverWorkerAppInfo> = new BehaviorSubject(null);

  private _workerAppObject: Observer.ObserverWorkerAppInfo;

  constructor(@Inject(RESOURCE_SERVICE_INPUTS) inputs: ResourceServiceInputs, protected _observerApiService: ObserverService) {
    super(inputs);
  }

  public startInitializationObservable() {
    this._initialized = this._observerApiService.getWorkerApp(this._armResource.resourceName)
      .pipe(map((observerResponse: Observer.ObserverWorkerAppResponse) => {
        this._observerResource = this._workerAppObject = this.getWorkerAppFromObserverResponse(observerResponse);
        this._currentResource.next(this._workerAppObject);
        return true;
      }))
  }

    public getCurrentResource(): Observable<any> {
        return this._currentResource;
    }

    private getWorkerAppFromObserverResponse(observerResponse: Observer.ObserverWorkerAppResponse): Observer.ObserverWorkerAppInfo {
        return observerResponse.details.find(workerapp =>
            workerapp.SubscriptionName.toLowerCase() === this._armResource.subscriptionId.toLowerCase() &&
            workerapp.ResourceGroupName.toLowerCase() === this._armResource.resourceGroup.toLowerCase())
    }
}
