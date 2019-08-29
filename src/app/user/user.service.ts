import { Injectable } from '@angular/core';
import { SignInDTO } from './sign-in.dto';
import { Observable, of, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { SignUpDTO } from './signup.dto';
import { ConfirmDTO } from './confirm.dto';
import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
    ISignUpResult,
    CognitoAccessToken,
    CognitoUserSession,
} from 'amazon-cognito-identity-js';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private userPoolIds = environment.userPool;
    private userPool = new CognitoUserPool(this.userPoolIds);

    constructor() {}

    isAuthenticated(): Promise<boolean> {
        return this.getUserSession()
            .then(session => session.isValid)
            .catch(err => false);
    }

    getAuthenticatedUser(): CognitoUser {
        return this.userPool.getCurrentUser();
    }

    getUserSession(user?: CognitoUser): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!user) {
                user = this.getAuthenticatedUser();
            }
            if (!user) {
                reject(new Error('not_authenticated'));
            }
            user.getSession((err, session) => {
                if (err) {
                    reject(err);
                }
                resolve(session);
            });
        });
    }

    getUserAccessToken(): Promise<string> {
        return this.getUserSession().then((session: CognitoUserSession) => session.getAccessToken().getJwtToken());
    }

    getUserIdToken(): Promise<string> {
        return this.getUserSession().then((session: CognitoUserSession) => session.getIdToken().getJwtToken());
    }

    confirm(input: ConfirmDTO): Promise<any> {
        console.log('confirm user: ', input);
        const { username, code } = input;
        const user = new CognitoUser({ Username: username, Pool: this.userPool });
        return new Promise((resolve, reject) => {
            user.confirmRegistration(code, true, (err, result) => {
                if (err) {
                    console.log('confirm error: ', err);
                    reject(err);
                }
                console.log('confirm result: ', result);
                resolve(result);
            });
        });
    }

    reconfirm(username: string): Promise<any> {
        console.log('re-confirm user: ', username);
        const user = new CognitoUser({ Username: username, Pool: this.userPool });
        return new Promise((resolve, reject) => {
            if (!username) {
                reject(new Error('username_missing'));
            }
            user.resendConfirmationCode((err, result) => {
                if (err) {
                    console.log('reconfirm error: ', err);
                    reject(err);
                }
                console.log('reconfirm result: ', result);
                resolve(result);
            });
        });
    }

    signin(input: SignInDTO): Promise<any> {
        const { username, password } = input;
        const auth = new AuthenticationDetails({ Username: username, Password: password });
        const user = new CognitoUser({ Username: username, Pool: this.userPool });
        return new Promise((resolve, reject) => {
            user.authenticateUser(auth, {
                onSuccess: result => {
                    console.log('signin result: ', result);
                    resolve(username);
                },
                onFailure: err => {
                    console.log('signin error: ', err);
                    reject(err);
                },
                newPasswordRequired: (userAttribute, requiredAttributes) =>
                    reject({
                        code: 'PasswordResetRequiredException',
                        message: 'New password required',
                        newPasswordRequired: true,
                    }),
            });
        });
    }

    signout(): Promise<any> {
        this.getAuthenticatedUser().signOut();
        return Promise.resolve(true);
    }

    signup(input: SignUpDTO): Promise<any> {
        console.log('user signup: ', input);
        const { username, password } = input;
        const attributes: CognitoUserAttribute[] = this.buildAttributes(input);
        return new Promise((resolve, reject) => {
            this.userPool.signUp(username, password, attributes, null, (err, result) => {
                if (err) {
                    reject(err);
                }
                console.log('signup result: ', result);
                resolve(result);
            });
        }).then((result: ISignUpResult) => result.user.getUsername());
    }

    private buildAttributes(input: SignInDTO): CognitoUserAttribute[] {
        const attributes: CognitoUserAttribute[] = [];
        attributes.push(new CognitoUserAttribute({ Name: 'email', Value: input.username }));
        return attributes;
    }
}
