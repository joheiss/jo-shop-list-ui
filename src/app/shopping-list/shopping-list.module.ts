import { NgModule } from '@angular/core';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../shared/shared.module';
import { ShoppingListRoutingModule } from './shopping-list-routing.module';
import { ListsComponent } from './lists/lists.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { ListItemComponent } from './list-item/list-item.component';
import { ListItemsComponent } from './list-items/list-items.component';

@NgModule({
  declarations: [ListComponent, ListsComponent, ShoppingListComponent, ListItemComponent, ListItemsComponent],
  imports: [SharedModule, ShoppingListRoutingModule]
})
export class ShoppingListModule { }
