import { Component, Input, OnChanges, SimpleChanges, OnDestroy, ViewChild, SimpleChange } from '@angular/core';
import { ShoppingListDTO, ShoppingItemDTO } from '../shopping-list.dto';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { ShoppingListMode } from '../store/shopping-list.state';
import { ShoppingListStore } from '../store/shopping-list.store';
import { Observable, of, EMPTY } from 'rxjs';
import { tap, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ErrorPopupService } from 'src/app/shared/error-popup/error-popup.service';
import { SubSink } from 'subsink';
import { ListItemsComponent } from '../list-items/list-items.component';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnChanges, OnDestroy {
    @Input() list: ShoppingListDTO;
    @Input() mode: ShoppingListMode;

    form: FormGroup;
    @ViewChild(ListItemsComponent, { static: false }) itemsForm: ListItemsComponent;

    private subs = new SubSink();
    private isChangeListenerRegistered = false;

    constructor(private readonly listStore: ShoppingListStore, private readonly errorService: ErrorPopupService) {}

    ngOnChanges(changes: SimpleChanges): void {
        console.log('List Component changes: ', changes);
        // if (!this.form) {
        //     this.form = this.buildForm();
        //     this.disableForm();
        //     this.registerChangeListeners(this.form.value);
        // if (this.mode === ShoppingListMode.display) {
        //     this.disableForm();
        // } else {
        //     this.enableForm();
        //     this.registerChangeListeners(this.form);
        // }
        // }
        if (!this.form) {
            this.buildForm();
        } else {
            if (this.list) {
                this.patchForm();
            }
            this.handleModeChange(changes.mode);
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    existsNext(): boolean {
        return this.listStore.getIndex() > 0;
    }

    existsPrev(): boolean {
        return this.listStore.getIndex() < this.listStore.getSize() - 1;
    }

    onCopy(): void {
        this.listStore.copyList();
    }

    onEdit(): void {
        this.listStore.changeMode(ShoppingListMode.edit);
    }

    onNew(): void {
        this.listStore.newList();
        this.listStore.changeMode(ShoppingListMode.edit);
        // this.form.reset();
    }

    onNext(): void {
        this.itemsForm.forceBuild = true;
        this.listStore.selectNextList();
    }

    onPrev(): void {
        this.itemsForm.forceBuild = true;
        this.listStore.selectPrevList();
    }

    onRemove(): void {
        this.subs.sink = this.listStore
            .deleteList(this.list.id)
            .pipe(
                tap(() => this.form.markAsPristine()),
                catchError(err => {
                    this.errorService.openDialog({ message: err.message });
                    return of(EMPTY);
                })
            )
            .subscribe();
    }

    onSave(): void {
        let obs: Observable<ShoppingListDTO>;
        if (this.list.id) {
            obs = this.listStore.updateList(this.list.id, this.list);
        } else {
            obs = this.listStore.createList(this.list);
        }
        this.subs.sink = obs
            .pipe(
                tap(() => this.form.markAsPristine()),
                catchError(err => {
                    this.errorService.openDialog({ message: err.message });
                    return of(EMPTY);
                })
            )
            .subscribe();
    }

    onShop(): void {
        this.listStore.changeMode(ShoppingListMode.shop);
    }

    onUndo(): void {
        this.itemsForm.forceBuild = true;
        this.listStore.undoChanges();
        this.patchForm();
        this.markFormAsPristine();
    }

    onAddItem(): void {
        const { items, ...header } = this.list;
        items.push({});
        this.list = { ...header, items };
    }

    onClearItems(): void {
        const { items, ...header } = this.list;
        this.list = { ...header, items: [] };
    }

    onDeleteItem(item: ShoppingItemDTO): void {
        const { items, ...header } = this.list;
        this.list = { ...header, items: items.filter(i => i.id !== item.id) };
    }

    private buildForm(): void {
        this.form = new FormGroup({
            title: new FormControl(null),
            lines: new FormArray([]),
        });
        if (this.list) {
            this.patchForm();
        }
        this.disableForm();
    }

    private disableForm(): void {
        this.form.disable();
        if (this.itemsForm) {
            this.itemsForm.lines.disable();
        }
        this.markFormAsPristine();
    }

    private enableForm(): void {
        this.form.enable();
        if (this.itemsForm) {
            this.itemsForm.lines.enable();
        }
        if (!this.isChangeListenerRegistered) {
            this.registerChangeListeners(this.form.value);
        }
    }

    private handleModeChange(modeChanges: SimpleChange): void {
        if (!modeChanges) {
            return;
        }
        this.mode === ShoppingListMode.display ? this.disableForm() : this.enableForm();
    }

    private markFormAsPristine(): void {
        this.form.markAsPristine();
        if (this.itemsForm) {
            this.itemsForm.lines.markAsPristine();
        }
    }
    private patchForm(): void {
        this.form.patchValue({ title: this.list.title }, { emitEvent: false });
    }

    private registerChangeListeners(group: FormGroup): void {
        this.subs.sink = this.form
            .get('title')
            .valueChanges.pipe(
                debounceTime(600),
                distinctUntilChanged(),
                tap((title: string) => {
                    const current = { ...this.list, title };
                    this.listStore.changeList(current);
                    // this.form.markAsDirty();
                })
            )
            .subscribe();
        this.isChangeListenerRegistered = true;
    }
}
