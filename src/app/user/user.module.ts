import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { UserRoutingModule } from './user-routing.module';

import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { ConfirmComponent } from './confirm/confirm.component';


@NgModule({
  declarations: [SignInComponent, SignUpComponent, SignOutComponent, ConfirmComponent],
  imports: [SharedModule, UserRoutingModule]
})
export class UserModule { }
