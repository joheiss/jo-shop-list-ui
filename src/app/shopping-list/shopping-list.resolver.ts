import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ShoppingListDTO } from './shopping-list.dto';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ShoppingListStore } from './store/shopping-list.store';
import { take, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ShoppingListResolver implements Resolve<Observable<ShoppingListDTO[]>> {
    constructor(private readonly listStore: ShoppingListStore) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ShoppingListDTO[]> {
        console.log('Hey, here is the resolver working ...');
        return this.listStore
            .getLists()
            .pipe(
                take(1),
                tap(lists => lists.length === 0 && this.listStore.newList())
            );
    }
}
