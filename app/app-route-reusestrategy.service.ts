import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from "@angular/router";

export class CustomReuseStrategy implements RouteReuseStrategy {

    handlers: { [key: string]: DetachedRouteHandle } = {};

     /**
     * Determines if this route (and its subtree) should be detached to be reused later.
     */
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return !!route.data && !!(route.data as any).cacheComponent; 
    }

    /**
     * Stores the detached route.
     */
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        let url = this._getUrl(route);
        this.handlers[url] = handle;
    }

    /**
     * Determines if this route (and its subtree) should be reattached.
     */
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        let url = this._getUrl(route);
        return !!route.routeConfig && !!this.handlers[url];
    }

    /**
     * Retrieves the previously stored route.
     */
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        if (!route.routeConfig) return null;

        let url = this._getUrl(route);
        return this.handlers[url];
    }

    /**
     * Determines if a route should be reused.
     */
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {

        if (curr.routeConfig === null && future.routeConfig === null) {
            return true;
        }

        // never reuse routes with incompatible configurations
        if (future.routeConfig !== curr.routeConfig) {
            return false;
        }

        return this._getUrl(future) === this._getUrl(curr);
        
    }

    private _getUrl(route: ActivatedRouteSnapshot): string {
        var url = '';
        route.url.forEach((item) => {
            url += `${item.path}/`;
        });

        return url;
    }
}
