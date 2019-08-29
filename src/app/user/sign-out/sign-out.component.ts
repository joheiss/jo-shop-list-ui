import { Component, OnInit } from '@angular/core';
import { UserStore } from '../store/user.store';
import { ShoppingListStore } from '../../shopping-list/store/shopping-list.store';

@Component({
    selector: 'app-sign-out',
    templateUrl: './sign-out.component.html',
    styleUrls: ['./sign-out.component.scss'],
})
export class SignOutComponent implements OnInit {
    constructor(private readonly userStore: UserStore, private readonly listStore: ShoppingListStore) {}

    ngOnInit() {
        this.userStore.clear();
        this.listStore.clear();
        this.userStore.signout().subscribe();
    }
}
