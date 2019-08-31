import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { ShoppingListDTO } from '../shopping-list.dto';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ShoppingListMode, ShoppingListSettings } from '../store/shopping-list.state';
import { ShoppingListStore } from '../store/shopping-list.store';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ErrorPopupService } from 'src/app/shared/error-popup/error-popup.service';
import { SubSink } from 'subsink';
import { ListItemsComponent } from '../list-items/list-items.component';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnChanges, OnDestroy {
    @Input() list: ShoppingListDTO;
    @Input() mode: ShoppingListMode;
    @Input() settings: ShoppingListSettings;

    form: FormGroup;
    @ViewChild(ListItemsComponent, { static: false}) itemsForm: ListItemsComponent;

    private subs = new SubSink();

    constructor(private readonly listStore: ShoppingListStore, private readonly errorService: ErrorPopupService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.form) {
            this.buildForm();
        }
        if (changes.list.firstChange ||
            changes.list.currentValue.id !== changes.list.previousValue.id ||
            changes.list.currentValue.title !== changes.list.previousValue.title ||
            changes.mode ||
            changes.settings) {
            this.patchForm();
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

    isFiltered(): boolean {
        return this.settings.filtered;
    }

    onCopy(): void {
        this.subs.sink = this.autoSave().pipe(
            tap(() => this.listStore.copyList())
        ).subscribe();
    }

    onEdit(): void {
        this.subs.sink = this.autoSave().pipe(
            tap(() => {
                if (this.itemsForm) {
                    this.itemsForm.forceBuild = true;
                }
                this.listStore.changeMode(ShoppingListMode.edit);
            }),
        ).subscribe();
    }

    onNew(): void {
        this.subs.sink = this.autoSave().pipe(
            tap(() => {
                this.listStore.newList();
                this.listStore.changeMode(ShoppingListMode.edit);
            }),
        ).subscribe();
    }

    onNext(): void {
        this.subs.sink = this.autoSave().pipe(
            tap(() => {
                this.itemsForm.forceBuild = true;
                this.listStore.selectNextList();
            }),
        ).subscribe();
    }

    onPrev(): void {
        this.subs.sink = this.autoSave().pipe(
            tap(() => {
                this.itemsForm.forceBuild = true;
                this.listStore.selectPrevList();
                this.markFormAsPristine();
            }),
        ).subscribe();
    }

    onRemove(): void {
        this.subs.sink = this.listStore
            .deleteList(this.list.id)
            .pipe(
                tap(() => this.markFormAsPristine()),
                catchError(err => {
                    this.errorService.openDialog({ message: err.message });
                    return of(EMPTY);
                }),
            )
            .subscribe();
    }

    onSave(): void {
        this.subs.sink = this.listStore.saveList(this.list)
            .pipe(
                tap(() => this.markFormAsPristine()),
                catchError(err => {
                    this.errorService.openDialog({ message: err.message });
                    return EMPTY;
                }),
            )
            .subscribe();
    }

    onShop(): void {
        this.subs.sink = this.autoSave().pipe(
            tap(() => {
                this.itemsForm.forceBuild = true;
                this.listStore.changeMode(ShoppingListMode.shop);
            }),
        ).subscribe();
    }

    onToggleFilter(): void {
        this.listStore.changeSettings({ filtered: !this.settings.filtered });
        this.itemsForm.forceBuild = true;
    }

    onUndo(): void {
        this.itemsForm.forceBuild = true;
        this.listStore.undoChanges();
        this.patchForm();
        this.markFormAsPristine();
    }

    private autoSave(): Observable<ShoppingListDTO> {
        if (!this.form.dirty || this.form.invalid || !this.listStore.getSettings().autoSave) {
            return of(this.list);
        }
        console.log('performing the auto save ...');
        return this.listStore.saveList(this.list)
            .pipe(
                // tap(() => this.markFormAsPristine()),
                catchError(err => {
                    this.errorService.openDialog({ message: err.message });
                    return EMPTY;
                }),
            );
    }

    private buildForm(): void {
        this.form = new FormGroup({
            title: new FormControl(null),
            lines: new FormArray([]),
        });
        if (this.list) {
            this.patchForm();
        }
        this.registerChangeListeners();
        this.markFormAsPristine();
    }

    private markFormAsPristine(): void {
        console.log('ListComponent:  markFormAsPristine');
        this.form.markAsPristine();
        if (this.itemsForm) {
            this.itemsForm.forceBuild = true;
        }
    }

    private patchForm(): void {
        this.form.patchValue({ title: this.list.title }, { emitEvent: false });
        this.mode === ShoppingListMode.edit ? this.form.enable() : this.form.disable();
    }

    private registerChangeListeners(): void {
        this.subs.sink = this.form
            .get('title')
            .valueChanges.pipe(
                debounceTime(600),
                distinctUntilChanged(),
                tap((title: string) => {
                    const current = { ...this.list, title };
                    this.listStore.changeList(current);
                }),
            )
            .subscribe();
    }
}
