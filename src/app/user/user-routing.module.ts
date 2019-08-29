import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignOutComponent } from './sign-out/sign-out.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ConfirmComponent } from './confirm/confirm.component';

const routes: Routes = [
  { path: 'signup', component: SignUpComponent },
  { path: 'confirm', component: ConfirmComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'signout', component: SignOutComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
