import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { Injectable, ComponentRef } from '@angular/core';

@Injectable()
export class CustomReuseStrategy implements RouteReuseStrategy {

    handlers: { [key: string]: DetachedRouteHandle } = {};
    enableConsoleLogging:boolean = false;
    closedTab: string;

    consoleLog(logString:string) {
        if(this.enableConsoleLogging){
            console.log(logString);
        }
    }

    /**
    * Determines if this route (and its subtree) should be detached to be reused later.
    */
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        const url = this._getUrl(route);
        let res:boolean;
        
        if (!route.routeConfig) {
            res = false; }
        if (route.routeConfig.loadChildren) {
            res = false; }
        res = !!route.data && !!(route.data as any).cacheComponent;

        this.consoleLog(`ShouldDetach... : ${url}`);
        let cacheKey = this.getCacheKey(route, url); //Only for logging
        this.consoleLog(`   Return Value : ${res}`);

        return res;
    }

    /**
     * Stores the detached route.
     */
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const url = this._getUrl(route);

        this.consoleLog(`Store...  ${url}`);

        let cacheKey:string = this.getCacheKey(route, url);
        
        if (this.closedTab === url || this.closedTab === cacheKey) {
            this._deactivateOutlet(handle);
            this.closedTab = null;

            this.consoleLog('   Closing & deactivating this...');

            return;
        }

        this.handlers[cacheKey] = handle;
    }

    /**
     * Determines if this route (and its subtree) should be reattached.
     */
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const url = this._getUrl(route);
        this.consoleLog(`ShouldAttach... : ${url}`);
        
        let res:boolean = !!route.routeConfig && !!this.handlers[this.getCacheKey(route, url)];
        this.consoleLog(`   Return Value : ${res}`);
        return res;
    }

    /**
     * Retrieves the previously stored route.
     */
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {

        const url = this._getUrl(route);
        this.consoleLog(`Retrieve... : ${url}`);

        if (!route.routeConfig) {
            this.consoleLog('   Return NULL. No route config');
            return null;
        }
        if (route.routeConfig.loadChildren) {
            this.consoleLog('   Return NULL. Load Children');
            return null;
        }

        this.consoleLog('   Return component handle');

        return this.handlers[this.getCacheKey(route, url)];
    }

    /**
     * Determines if a route should be reused.
     */
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        let res:boolean;
        if (curr.routeConfig === null && future.routeConfig === null) {
            res = true;
        }
        if (future.routeConfig !== curr.routeConfig) {
            res = false;
        }

        res = this._getUrl(future) === this._getUrl(curr);
        
        this.consoleLog(`ShouldReuseRoute...`);
        this.consoleLog(`   Future:  ${this._getUrl(future)}`);
        let futureCacheKey = this.getCacheKey(future, this._getUrl(future));
        this.consoleLog(`   Current:  ${this._getUrl(curr)}`);
        let currentCacheKey = this.getCacheKey(curr, this._getUrl(curr));
        this.consoleLog(`   Return Value : ${res}`);
        return res;

    }

    removeCachedRoute(url: string) {
        this.closedTab = url;
        this._deactivateOutlet(this.handlers[url]);
        this.consoleLog(`RemoveCachedRoute... : ${url}`);
        this.handlers[url] = null;
    }

    public getCacheKey(route: ActivatedRouteSnapshot, url:string):string {
        let cacheKey:string = url;
        let allRouteQueryParams = route.queryParams;
        Object.keys(allRouteQueryParams).forEach(key => {
                cacheKey += `&${key}=${encodeURIComponent(allRouteQueryParams[key])}`;
        });
        this.consoleLog(`   ---------------------------${cacheKey}`);

        return cacheKey;
    }

    private _deactivateOutlet(handle: DetachedRouteHandle): void {
        if (handle) {
            const componentRef: ComponentRef<any> = handle['componentRef'];
            if (componentRef) {
                componentRef.destroy();
            }
        }
    }

    private _getUrl(route: ActivatedRouteSnapshot): string {
        const topLevelParent = this._getParent(route);
        const fullUrl = '/' + this._getFullUrl(topLevelParent);

        return fullUrl;
    }

    private _getParent(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
        return route.parent ? this._getParent(route.parent) : route;
    }

    private _getFullUrl(route: ActivatedRouteSnapshot): string {
        if (!route) {
            return null;
        }

        const childRoute = this._getFullUrl(route.firstChild);
        if (!route.url || route.url.length === 0) {
            return childRoute;
        }

        const currentRoute = route.url.join('/');
        const returnValue = childRoute && childRoute !== '' ? [currentRoute, childRoute].join('/') : currentRoute;
        return returnValue;
    }
}
