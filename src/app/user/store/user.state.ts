export interface UserState {
    id: string;
    signedUp: boolean;
    confirmed: boolean;
    signedIn: boolean;
    error: any;
    loading: boolean;
}

export const userInitialState = {
    id: null,
    signedUp: false,
    confirmed: false,
    signedIn: false,
    error: null,
    loading: false,
};
