import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ShoppingItemDTO } from '../shopping-list.dto';
import { ShoppingListStore } from '../store/shopping-list.store';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { ShoppingListMode } from '../store/shopping-list.state';

@Component({
    selector: 'app-list-item',
    templateUrl: './list-item.component.html',
    styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent implements OnChanges, OnDestroy {
    @Input() line: FormGroup;
    @Input() mode: ShoppingListMode;
    @Input() item: ShoppingItemDTO;
    @Output() update = new EventEmitter<ShoppingItemDTO>();
    @Output() delete = new EventEmitter<ShoppingItemDTO>();

    private subs = new SubSink();
    private isLineBuilt = false;
    private isChangeListenerRegistered = false;

    constructor(private readonly listStore: ShoppingListStore) {}

    ngOnChanges(changes: SimpleChanges) {
        if (!this.isLineBuilt) {
            this.line = this.buildLine();
            if (this.mode === ShoppingListMode.display) {
                this.line.disable();
            } else {
                this.line.enable();
            }
            this.patchItem();
            this.line.markAsPristine();
            this.registerChangeListeners(this.line.value);
        }
        if (changes.mode) {
            if (this.mode === ShoppingListMode.display) {
                this.line.disable();
            } else {
                this.line.enable();
            }
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    onDelete(): void {
        console.log('item to be deleted: ', this.item);
        this.delete.emit(this.item);
    }

    onToggleDone(): void {
        const isDone = !this.item.isDone;
        this.update.emit({ ...this.item, isDone });
    }

    onUpdate(value: { [key: string]: any }): void {
        let updated = false;
        Object.keys(value).forEach(key => {
            if (value[key] !== this.item[key]) {
                updated = true;
            }
        });
        if (updated) {
            this.update.emit({ ...this.item, ...value });
            this.line.markAsDirty();
        }
    }

    private buildLine(): FormGroup {
        const line = new FormGroup({
            description: new FormControl(null),
            // quantity: new FormControl(null),
            category: new FormControl(null),
            isDone: new FormControl(false),
        });
        this.isLineBuilt = true;
        return line;
    }

    private patchItem(): void {
        const { id, ...patch } = this.item;
        this.line.patchValue(patch, { emitEvent: false });
    }

    private registerChangeListeners(group: FormGroup): void {
        Object.keys(this.line.value).forEach(prop => {
            this.subs.sink = this.line
                .get(prop)
                .valueChanges.pipe(
                    debounceTime(600),
                    distinctUntilChanged(),
                    tap(value => this.onUpdate({ [prop]: value }))
                )
                .subscribe();
        });
        this.isChangeListenerRegistered = true;
    }
}
