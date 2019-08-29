import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { ShoppingListDTO } from '../shopping-list.dto';
import { Router } from '@angular/router';
import { UserStore } from 'src/app/user/store/user.store';
import { ShoppingListStore } from '../store/shopping-list.store';
import { tap, take } from 'rxjs/operators';

@Component({
    selector: 'app-shopping-list',
    templateUrl: './shopping-list.component.html',
    styleUrls: ['./shopping-list.component.scss'],
})
export class ShoppingListComponent implements OnInit, OnDestroy {
    subs = new SubSink();
    lists: ShoppingListDTO[];

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
        this.subs.sink = this.listStore.stateChanged.subscribe(state => (this.lists = state.lists));
        this.subs.sink = this.listStore
            .getLists()
            .pipe(take(1))
            .subscribe();
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
