import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { AuthenticatedGuard } from '../user/authenticated.guard';
import { ListsComponent } from './lists/lists.component';

const routes: Routes = [
    {
        path: 'shoplist',
        canActivate: [AuthenticatedGuard],
        children: [
            {
                path: 'lists',
                component: ListsComponent,
            },
            {
                path: 'list',
                component: ListComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ShoppingListRoutingModule {}
