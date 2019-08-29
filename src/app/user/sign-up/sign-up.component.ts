import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {catchError, tap} from 'rxjs/operators';
import {EMPTY, of} from 'rxjs';
import { UserStore } from '../store/user.store';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
    signup: FormGroup;
    message = '';

    constructor(private readonly router: Router, private readonly userStore: UserStore) {}

    ngOnInit() {
        this.signup = this.buildForm();
    }

    onSubmit() {
        console.log(this.signup.value);
        this.userStore.signup(this.signup.value)
            .pipe(
                tap(() => this.message = ''),
                tap(() => this.router.navigateByUrl('/confirm')),
                catchError(err => {
                    console.log(err);
                    this.message = err.message;
                    return of(EMPTY);
                })
            )
            .subscribe();
    }

    private buildForm(): FormGroup {
        return new FormGroup({
            username: new FormControl('', {validators: [Validators.required, Validators.email]}),
            password: new FormControl('', {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(20),
                    Validators.pattern(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
                ],
              }),
                confirm: new FormControl('', {
                  validators: [
                      Validators.required,
                      Validators.minLength(8),
                      Validators.maxLength(20),
                      Validators.pattern(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
                  ]
                }),
        });
    }
}
