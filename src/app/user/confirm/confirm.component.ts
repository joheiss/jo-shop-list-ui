import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { take, tap, catchError } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';
import { UserStore } from '../store/user.store';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  confirm: FormGroup;
  message = '';
  username = '';

  constructor(private readonly router: Router, private readonly userStore: UserStore) {}

  ngOnInit() {
      this.confirm = this.buildForm();
      this.userStore.getUser()
        .pipe(
          tap(username => {
            this.confirm.patchValue({ username });
            this.username = username;
          })
        )
        .subscribe();
  }

  onSubmit() {
      console.log(this.confirm.value);
      this.userStore.confirm(this.confirm.value)
          .pipe(
              take(1),
              tap(() => this.message = ''),
              tap(() => this.router.navigateByUrl('/signin')),
              catchError((err) => {
                console.log('The response from the server: ', err);
                this.message = err.message;
                return of(EMPTY);
            })
          )
          .subscribe();
  }

  onRequest() {
    console.log(this.confirm.value);
    const { username } = this.confirm.value;
    this.userStore.reconfirm(username)
        .pipe(
            take(1),
            tap(() => this.message = ''),
            catchError((err) => {
              console.log('The response from the server: ', err);
              this.message = err.message;
              return of(EMPTY);
            })
        )
        .subscribe();
}

  private buildForm(): FormGroup {
      return new FormGroup({
          username: new FormControl('', {validators: [Validators.required, Validators.email]}),
          code: new FormControl('', { validators: [Validators.required] })
      });
  }
}
