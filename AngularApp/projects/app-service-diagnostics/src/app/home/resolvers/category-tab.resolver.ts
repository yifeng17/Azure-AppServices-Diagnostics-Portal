import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { CategoryService } from '../../shared-v2/services/category.service';
import { Observable, of } from 'rxjs';
import { GenericCategoryFlow } from '../../supportbot/message-flow/v2-flows/generic-category.flow';
import { GenieChatFlow } from '../../supportbot/message-flow/v2-flows/genie-chat.flow';
import { mergeMap, first, map } from 'rxjs/operators';

@Injectable()
export class CategoryTabResolver implements Resolve<Observable<string>> {
    constructor(private _categoryService: CategoryService) { }

    resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<string> {
       if (activatedRouteSnapshot.params && activatedRouteSnapshot.params.category) {
         //  let decodedCategoryName = decodeURIComponent(activatedRouteSnapshot.params.category);
         let decodedCategoryName = activatedRouteSnapshot.params.category.toLowerCase();
           return this._categoryService.categories.pipe(map(categories => {
               return categories.find(category => category.id.toLowerCase() === activatedRouteSnapshot.params.category.toLowerCase() || category.name.replace(/\s/g, '').toLowerCase() === decodedCategoryName).name;
            }), first());
       }

       return of('Genie');
    }
}

@Injectable()
export class CategoryChatResolver implements Resolve<Observable<any>> {
    constructor(private _categoryService: CategoryService, private _genericCategoryService: GenericCategoryFlow, private _genieChatFlow: GenieChatFlow) { }

    resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<any> {
       if (activatedRouteSnapshot.params && activatedRouteSnapshot.params.category) {
       // let decodedCategoryName = decodeURIComponent(activatedRouteSnapshot.params.category);
       let decodedCategoryName = activatedRouteSnapshot.params.category.toLowerCase();
           return this._categoryService.categories.pipe(mergeMap(categories => {
               console.log("category", activatedRouteSnapshot.params.category);
               console.log("categories", categories);
               const category = categories.find(category => category.id.toLowerCase() === activatedRouteSnapshot.params.category.toLowerCase() || category.name.replace(/\s/g, '').toLowerCase() === decodedCategoryName);
               console.log("finding category", category);
               return this._genieChatFlow.createMessageFlowForCategory(category);
           }), first());
       }

       return of('Genie');
    }
}
