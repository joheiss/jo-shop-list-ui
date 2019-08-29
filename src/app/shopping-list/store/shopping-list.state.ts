import { ShoppingListDTO } from '../shopping-list.dto';

export enum ShoppingListMode {
    display = 'display',
    edit = 'edit',
    shop = 'shop',
}

export interface ShoppingListState {
    lists: ShoppingListDTO[];
    current: ShoppingListDTO;
    index: number;
    mode: ShoppingListMode;
    error: any;
    loading: boolean;
    loaded: boolean;
}

export const shoppingListInitialState = {
    lists: [],
    current: null,
    index: -1,
    mode: ShoppingListMode.display,
    error: null,
    loading: false,
    loaded: false,
};
