import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewChildren } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ShoppingItemDTO, ShoppingListDTO } from '../shopping-list.dto';
import { ShoppingListStore } from '../store/shopping-list.store';
import { ShoppingListMode, ShoppingListSettings } from '../store/shopping-list.state';
import { ListItemComponent } from '../list-item/list-item.component';

@Component({
    selector: 'app-list-items',
    templateUrl: './list-items.component.html',
    styleUrls: ['./list-items.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListItemsComponent implements OnChanges {
    @Input() lines: FormArray;
    @Input() list: ShoppingListDTO;
    @Input() mode: ShoppingListMode;
    @Input() settings: ShoppingListSettings;

    @ViewChildren(ListItemComponent) itemLines: ListItemComponent[];

    forceBuild = false;
    private lastItemCount = 0;

    constructor(private readonly listStore: ShoppingListStore) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        // only refresh items table if table size has changed or if different list is selected
        if (this.list && (this.lastItemCount !== this.list.items.length || this.forceBuild)) {
            this.buildItems();
        }
    }

    onAdd(): void {
        const { items, ...header } = this.list;
        const lastItemId = items && items.length ? items.map(item => item.id).sort((a, b) => b - a)[0] : 0;
        const id = lastItemId + 100;
        items.unshift({ id, trackId: this.list.id || 'new-' + id });
        const current = { ...header, items };
        this.listStore.changeList(current);
        // this.lines.markAsDirty();
    }

    onDelete(item: ShoppingItemDTO): void {
        const { items, ...header } = this.list;
        const current = { ...header, items: items.filter(i => i.id !== item.id) };
        this.listStore.changeList(current);
        this.lines.markAsDirty();
    }

    onUpdate(item: ShoppingItemDTO): void {
        const { items, ...header } = this.list;
        const updatedItems = [...items.filter(i => i.id !== item.id), item].sort(
            (a: ShoppingItemDTO, b: ShoppingItemDTO) => b.id - a.id,
        );
        const current = { ...header, items: updatedItems };
        this.listStore.changeList(current);
        this.lines.markAsDirty();
    }

    trackByItemId(index: number, item: ShoppingItemDTO): string {
        return item.trackId;
    }

    private buildItems(): void {
        this.forceBuild = false;
        while (this.lines && this.lines.length) {
            this.lines.removeAt(0);
        }
        this.list.items.forEach(item => this.lines.push(new FormGroup({})));
        this.lastItemCount = this.list.items.length;
    }
}
