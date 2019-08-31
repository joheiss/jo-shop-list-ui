import { ShoppingListDTO } from '../shopping-list.dto';

export enum ShoppingListMode {
    edit = 'edit',
    shop = 'shop',
}

export interface ShoppingListSettings {
    autoSave: boolean;
    sortByCategor?: boolean;
    filtered: boolean;
}

export interface ShoppingListState {
    lists: ShoppingListDTO[];
    current: ShoppingListDTO;
    index: number;
    mode: ShoppingListMode;
    error: any;
    loading: boolean;
    loaded: boolean;
    settings: ShoppingListSettings;
}

export const shoppingListInitialState = {
    lists: [],
    current: null,
    index: -1,
    mode: ShoppingListMode.edit,
    error: null,
    loading: false,
    loaded: false,
    settings: {
        autoSave: true,
        sortByCategory: true,
        filtered: true,
    }
};
