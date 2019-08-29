import { Injectable } from '@angular/core';
import { ObservableStore } from '@codewithdan/observable-store';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ShoppingListState, shoppingListInitialState, ShoppingListMode } from './shopping-list.state';
import { ShoppingListService } from '../shopping-list.service';
import { ShoppingListDTO } from '../shopping-list.dto';

@Injectable({
    providedIn: 'root',
})
export class ShoppingListStore extends ObservableStore<ShoppingListState> {
    constructor(private readonly listService: ShoppingListService) {
        super({
            trackStateHistory: !environment.production,
            logStateChanges: !environment.production,
        });
        this.setState(shoppingListInitialState, 'initialize');
    }

    clear(): void {
        this.setState(shoppingListInitialState, 'clear');
    }

    getLists(): Observable<ShoppingListDTO[]> {
        const state = this.getState();
        if (state && state.loaded) {
            return of(state.lists);
        }
        return this.fetchLists();
    }

    getList(id: string): Observable<ShoppingListDTO> {
        const state = this.getState();
        if (state && state.loaded) {
            const found = state.lists.find(l => l.id === id);
            if (!found) {
                throwError(`list_not_found: ${id}`);
            }
            return of(found);
        }
    }

    getIndex(): number {
        const state = this.getState();
        return state.index;
    }

    getSize(): number {
        const state = this.getState();
        return state.lists.length;
    }

    createList(input: ShoppingListDTO): Observable<ShoppingListDTO> {
        const payload = this.mapToDTO(input);
        return this.listService.create(payload).pipe(
            tap(list => {
                const state = this.getState();
                const current = this.mapTrackId(state.current, list.id);
                this.setState({ lists: [current, ...state.lists], current }, 'create_list');
            }),
            catchError(err => this.handleError(err))
        );
    }

    updateList(id: string, input: ShoppingListDTO): Observable<ShoppingListDTO> {
        const payload = this.mapToDTO(input);
        return this.listService.update(id, payload).pipe(
            tap(list => {
                const state = this.getState();
                const current = state.current;
                const lists = state.lists;
                const index = state.index;
                lists[index] = current;
                this.setState({ lists }, 'update_list');
            }),
            catchError(err => this.handleError(err))
        );
    }

    deleteList(id: string): Observable<ShoppingListDTO> {
        return this.listService.delete(id).pipe(
            tap(list => {
                const state = this.getState();
                const lists = state.lists.filter(l => l.id !== id);
                const size = this.getSize();
                let index = this.getIndex();
                let current: ShoppingListDTO = null;
                if (index > 0) {
                    index--;
                } else if (index === 0 && size > 0) {
                    index++;
                } else {
                    index = -1;
                }
                if (index >= 0) {
                    current = lists[index];
                }
                this.setState({ lists, current, index }, 'delete_list');
            }),
            catchError(err => this.handleError(err))
        );
    }

    changeList(list: ShoppingListDTO): void {
        const { items, ...header } = list;
        const current = { ...header, items: items.filter(i => i.description || i.category) };
        this.setState({ current: list }, 'change_list');
    }

    changeMode(mode: ShoppingListMode): void {
        this.setState({ mode }, 'change_mode');
    }

    copyList(): void {
        const state = this.getState();
        const { id, userId, title, issuedAt, items, ...copy } = state.current;
        const date = new Date();
        const newItems = items.map(item => {
            item.isDone = false;
            item.trackId = 'new-' + item.id;
            return item;
        });
        const current = {
            title: 'New List ' + date.toLocaleString(),
            issuedAt: date.toISOString(),
            items: newItems,
            ...copy,
        };
        this.setState({ current, mode: ShoppingListMode.edit }, 'copy_list');
    }

    newList(): void {
        const state = this.getState();
        const date = new Date();
        const current = {
            title: 'New List ' + date.toLocaleString(),
            issuedAt: date.toISOString(),
            items: [],
        };
        this.setState({ current }, 'new_list');
    }

    selectList(index: number): void {
        const state = this.getState();
        try {
            const current = this.mapTrackId(state.lists[index], state.lists[index].id);
            this.setState({ current, index }, 'select_list');
        } catch (e) {
            this.handleError(e);
        }
    }

    selectNextList(): void {
        const state = this.getState();
        if (state.index === 0) {
            return;
        }
        this.selectList(state.index - 1);
    }

    selectPrevList(): void {
        const state = this.getState();
        if (state.index >= state.lists.length - 1) {
            return;
        }
        this.selectList(state.index + 1);
    }

    undoChanges(): void {
        const state = this.getState();
        const lists = state.lists;
        const index = state.index;
        // restore current to recent current if list has not yet been stored
        const current = lists[index];
        const mode = ShoppingListMode.display;
        this.setState({ current, mode }, 'undo_changes');
    }

    private fetchLists(): Observable<ShoppingListDTO[]> {
        const state = this.getState();
        this.setState({ loading: true });
        return this.listService.getAll().pipe(
            map(all => {
                const lists = this.sortListsByIssuedAt(all);
                const index = lists.length > 0 ? 0 : -1;
                this.setState({ lists, index, loading: false, loaded: true }, 'fetch_lists');
                const current = index >= 0 ? this.selectList(index) : null;
                return lists;
            }),
            catchError(err => this.handleError(err))
        );
    }

    private handleError(err: any): never {
        console.error('Server error: ', err);
        throw err;
    }

    private mapToDTO(input: ShoppingListDTO): ShoppingListDTO {
        const { items, ...header } = input;
        items.forEach(item => delete item.trackId);
        return { ...header, items: items.filter(item => item.description && item.description.length) };
    }

    private mapTrackId(list: ShoppingListDTO, id: string): ShoppingListDTO {
        const { items, ...header } = list;
        items.forEach(item => (item.trackId = header.id + item.id));
        return { ...header, items, id };
    }

    private sortListsByIssuedAt(lists: ShoppingListDTO[]): ShoppingListDTO[] {
        return lists.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
    }
}
