import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { ShoppingListDTO, ShoppingItemDTO } from '../shopping-list.dto';
import { ShoppingListStore } from '../store/shopping-list.store';
import { ShoppingListMode } from '../store/shopping-list.state';

@Component({
    selector: 'app-list-items',
    templateUrl: './list-items.component.html',
    styleUrls: ['./list-items.component.scss'],
})
export class ListItemsComponent implements OnChanges {
    @Input() lines: FormArray;
    @Input() list: ShoppingListDTO;
    @Input() mode: ShoppingListMode;
    @Output() add = new EventEmitter<void>();
    @Output() clear = new EventEmitter<void>();
    @Output() delete = new EventEmitter<ShoppingItemDTO>();

    forceBuild = false;
    private lastItemCount = 0;

    constructor(private readonly listStore: ShoppingListStore) {}

    ngOnChanges(changes: SimpleChanges): void {
        console.log('changes: ', changes);
        // if (changes.list) {
        //     const { previousValue, currentValue } = changes.list;
        //     if ((currentValue && !previousValue) || currentValue.id !== previousValue.id) {
        //         this.forceBuild = true;
        //     }
        // }
        // only refresh items table if table size has changed or if different list is selected
        if (this.list && (this.lastItemCount !== this.list.items.length || this.forceBuild)) {
            this.buildItems();
        }
        // if (changes.mode) {
        //     this.mode === ShoppingListMode.display ? this.lines.disable() : this.lines.enable();
        // }
    }

    onAdd(): void {
        const { items, ...header } = this.list;
        const lastItemId = items && items.length ? items.map(item => item.id).sort((a, b) => b - a)[0] : 0;
        console.log('last item id: ', lastItemId);
        const id = lastItemId + 100;
        items.unshift({ id, trackId: this.list.id || 'new-' + id });
        console.log('items after UNSHIFT: ', items);
        const current = { ...header, items };
        this.listStore.changeList(current);
        this.lines.markAsDirty();
    }

    onClear(): void {
        const { items, ...header } = this.list;
        const current = { ...header, items: [] };
        this.listStore.changeList(current);
        this.lines.markAsDirty();
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
            (a: ShoppingItemDTO, b: ShoppingItemDTO) => b.id - a.id
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
        this.mode === ShoppingListMode.display ? this.lines.disable() : this.lines.enable();
    }
}
