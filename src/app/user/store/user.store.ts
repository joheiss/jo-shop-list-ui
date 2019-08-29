import {Injectable} from '@angular/core';
import {ObservableStore} from '@codewithdan/observable-store';
import {Observable, of, throwError, from} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import { UserState, userInitialState } from './user.state';
import { UserService } from '../user.service';
import { ConfirmDTO } from '../confirm.dto';
import { SignInDTO } from '../sign-in.dto';
import { SignUpDTO } from '../signup.dto';

@Injectable({
    providedIn: 'root'
})
export class UserStore extends ObservableStore<UserState> {

    constructor(private readonly userService: UserService) {
        super({
            trackStateHistory: !environment.production,
            logStateChanges: !environment.production
        });
        this.setState(userInitialState);
    }

    clear(): void {
        this.setState(userInitialState);
    }

    getUser(): Observable<string> {
        const state = this.getState();
        return of(state.id);
    }

    isAuthenticated(): Observable<boolean> {
        return from(this.userService.isAuthenticated());
    }

    confirm(credentials: ConfirmDTO): Observable<any> {
        return from(
            this.userService.confirm(credentials)
                .then(res => this.handleConfirmSuccess(res))
                .catch(err => this.handleConfirmFailure(err))
        );
    }

    reconfirm(username: string): Observable<any> {
        return from(
            this.userService.reconfirm(username)
                .then(res => this.handleReConfirmSuccess(res))
                .catch(err => this.handleReConfirmFailure(err))
        );
    }

    signin(credentials: SignInDTO): Observable<boolean | never> {
        return from(
            this.userService.signin(credentials)
                .then(res => this.handleSignInSuccess(res))
                .catch(err => this.handleSignInFailure(err))
        );
    }

    signout(): Observable<any> {
        return from(
            this.userService.signout()
                .then(res => this.handleSignOutSuccess(res))
        );
    }

    signup(credentials: SignUpDTO): Observable<any> {
       return from(
           this.userService.signup(credentials)
               .then(res => this.handleSignUpSuccess(res))
               .catch(err => this.handleSignUpFailure(err))
       );
    }

    private handleError(err: any): never {
        console.error('Server error: ', err);
        throw err;
    }

    private handleSignInSuccess(username: string): boolean {
        this.setState({ id: username, signedIn: true, error: null }, 'handle_signin_success');
        return true;
    }

    private handleSignInFailure(err: any): any {
        this.setState({ error: err }, 'handle_signin_failure');
        this.handleError(err);
    }

    private handleSignOutSuccess(data: any): boolean {
        this.setState(userInitialState, 'handle_signout_success');
        return true;
    }

    private handleSignUpSuccess(username: string): boolean {
        this.setState({ id: username, signedUp: true, error: null }, 'handle_signup_success');
        return true;
    }

    private handleSignUpFailure(err: any): any {
        this.setState({ signedUp: false, error: err }, 'handle_signup_failure');
        this.handleError(err);
    }

    private handleConfirmSuccess(data: any): boolean {
        this.setState({ confirmed: true, error: null }, 'handle_confirm_success');
        return true;
    }

    private handleConfirmFailure(err: any): any {
        this.setState({ confirmed: false, error: err }, 'handle_confirm_failure');
        this.handleError(err);
    }

    private handleReConfirmSuccess(username: string): boolean {
        this.setState({ id: username, error: null }, 'handle_reconfirm_success');
        return true;
    }

    private handleReConfirmFailure(err: any): any {
        this.setState({ error: err }, 'handle_reconfirm_failure');
        this.handleError(err);
    }

}
