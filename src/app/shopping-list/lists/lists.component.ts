import { Component, OnInit, OnDestroy } from '@angular/core';
import { of, EMPTY, Observable } from 'rxjs';
import { ShoppingListDTO } from '../shopping-list.dto';
import { Router } from '@angular/router';
import { UserStore } from 'src/app/user/store/user.store';
import { ShoppingListStore } from '../store/shopping-list.store';
import { tap, catchError, map, take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { ShoppingListMode } from '../store/shopping-list.state';

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit, OnDestroy {
    message = '';
    subs = new SubSink();
    lists: ShoppingListDTO[];
    list: Observable<ShoppingListDTO>;
    mode: ShoppingListMode;
    index = 0;

    constructor(
        private readonly router: Router,
        private readonly userStore: UserStore,
        private readonly listStore: ShoppingListStore
    ) {}

    ngOnInit() {
        this.userStore
            .isAuthenticated()
            .pipe(tap(authenticated => !authenticated && this.router.navigateByUrl('/signin')))
            .subscribe();
        this.subs.sink = this.listStore.stateChanged.subscribe(state => {
            this.lists = state.lists;
            this.index = state.index;
            this.list = state.current;
            this.mode = state.mode;
        });
        this.subs.sink = this.listStore
            .getLists()
            .pipe(
                take(1),
                tap(lists => lists.length === 0 && this.listStore.newList())
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
