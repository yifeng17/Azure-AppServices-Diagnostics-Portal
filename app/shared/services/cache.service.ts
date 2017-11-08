import { Http, Headers, Response, Request } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable, Subscription as RxSubscription, Subject, ReplaySubject } from 'rxjs/Rx';

import 'rxjs/add/operator/map';

interface CacheContent {
    value: any;
}

@Injectable()
export class CacheService {
    private cache: Map<string, CacheContent> = new Map<string, CacheContent>();
    private inFlightObservables: Map<string, Subject<any>> = new Map<string, Subject<any>>();

    get(key: string, fallback?: Observable<any>, invalidateCache: boolean = false): Observable<any> | Subject<any> {

        if (this.has(key)) {
            if (invalidateCache) {
                console.log(`%cInvalidating ${key}`, 'color: orange');
                this.cache.delete(key);
            }
            else {
                console.log(`%cGetting from cache ${key}`, 'color: green');
                return Observable.of(this.cache.get(key).value);
            }
        }

        if (this.inFlightObservables.has(key)) {
            return this.inFlightObservables.get(key);
        } else if (fallback && fallback instanceof Observable) {
            this.inFlightObservables.set(key, new Subject());
            console.log(`%c Calling api for ${key}`, 'color: purple');
            return fallback.do((value) => { this.set(key, value); });
        } else {
            return Observable.throw('Requested key is not available in Cache');
        }
    }

    /**
   * Sets the value with key in the cache
   * Notifies all observers of the new value
   */
    set(key: string, value: any): void {
        this.cache.set(key, { value: value });
        this.notifyInFlightObservers(key, value);
    }

    /**
     * Checks if the a key exists in cache
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }

    /**
     * Publishes the value to all observers of the given
     * in progress observables if observers exist.
     */
    private notifyInFlightObservers(key: string, value: any): void {
        if (this.inFlightObservables.has(key)) {
            const inFlight = this.inFlightObservables.get(key);
            const observersCount = inFlight.observers.length;
            if (observersCount) {
                console.log(`%cNotifying ${inFlight.observers.length} flight subscribers for ${key}`, 'color: blue');
                inFlight.next(value);
            }
            inFlight.complete();
            this.inFlightObservables.delete(key);
        }
    }
}