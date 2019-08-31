import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ShoppingListDTO } from '../shopping-list.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { UserStore } from 'src/app/user/store/user.store';
import { ShoppingListStore } from '../store/shopping-list.store';
import { tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { ShoppingListMode, ShoppingListSettings } from '../store/shopping-list.state';

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit, OnDestroy {
    message = '';
    subs = new SubSink();
    lists: ShoppingListDTO[];
    list: ShoppingListDTO;
    mode: ShoppingListMode;
    settings: ShoppingListSettings;
    index = 0;

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute,
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
            this.settings = state.settings;
        });
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
