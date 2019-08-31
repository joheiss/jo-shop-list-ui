import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ShoppingItemDTO } from '../shopping-list.dto';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { ShoppingListMode } from '../store/shopping-list.state';

@Component({
    selector: 'app-list-item',
    templateUrl: './list-item.component.html',
    styleUrls: ['./list-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListItemComponent implements OnChanges, OnDestroy {
    @Input() line: FormGroup;
    @Input() mode: ShoppingListMode;
    @Input() item: ShoppingItemDTO;
    @Output() update = new EventEmitter<ShoppingItemDTO>();
    @Output() delete = new EventEmitter<ShoppingItemDTO>();

    private subs = new SubSink();
    private isLineBuilt = false;

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.isLineBuilt) {
            this.buildLine();
            this.patchItem();
            this.line.markAsPristine();
            this.registerChangeListeners();
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    onDelete(): void {
        this.delete.emit(this.item);
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

    private buildLine(): void {
        let formState = null;
        if (this.mode === ShoppingListMode.shop) {
            formState = { value: '', disabled: true };
        }
        this.line.addControl('description', new FormControl(formState));
        this.line.addControl('category', new FormControl(formState));
        this.line.addControl('isDone', new FormControl(false));
        this.isLineBuilt = true;
    }

    private patchItem(): void {
        const { id, ...patch } = this.item;
        this.line.patchValue(patch, { emitEvent: false });
    }

    private registerChangeListeners(): void {
        Object.keys(this.line.value).forEach(prop => {
            this.subs.sink = this.line
                .get(prop)
                .valueChanges.pipe(
                    debounceTime(600),
                    distinctUntilChanged(),
                    tap(value => this.onUpdate({ [prop]: value })),
                )
                .subscribe();
        });
    }
}
