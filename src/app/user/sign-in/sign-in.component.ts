import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { catchError, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { UserStore } from '../store/user.store';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
    signin: FormGroup;
    message = '';

    constructor(private readonly router: Router, private readonly userStore: UserStore) {}

    ngOnInit() {
        this.signin = this.buildForm();
    }

    onSubmit() {
        console.log(this.signin.value);
        this.userStore
            .signin(this.signin.value)
            .pipe(
                tap(() => (this.message = '')),
                tap(() => this.router.navigateByUrl('/shoplist/lists')),
                catchError(err => {
                    console.log('The response from the server: ', err);
                    this.message = err.message;
                    return of(EMPTY);
                })
            )
            .subscribe(next => console.log('next: ', next), error => console.log('error: ', error.message));
    }

    private buildForm(): FormGroup {
        return new FormGroup({
            username: new FormControl('', { validators: [Validators.required, Validators.email] }),
            password: new FormControl('', {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(20),
                    Validators.pattern(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/),
                ],
            }),
        });
    }
}
