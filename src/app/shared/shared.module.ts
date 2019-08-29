import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ErrorPopupComponent } from './error-popup/error-popup.component';
import { ErrorPopupService } from './error-popup/error-popup.service';
import { MaterialModule } from './material.module';
import { AuthenticationInterceptor } from '../user/authentication.interceptor';

@NgModule({
    declarations: [ErrorPopupComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, FlexLayoutModule, HttpClientModule],
    exports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ReactiveFormsModule,
        MaterialModule,
        FlexLayoutModule,
        HttpClientModule,
    ],
    providers: [
        ErrorPopupService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthenticationInterceptor,
            multi: true,
        },
    ],
    entryComponents: [ErrorPopupComponent],
})
export class SharedModule {}
