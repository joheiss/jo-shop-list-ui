import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { tap } from 'rxjs/operators';

import { ErrorPopupComponent } from './error-popup.component';

@Injectable({
    providedIn: 'root',
})
export class ErrorPopupService {
    isDialogOpen = false;

    constructor(public dialog: MatDialog) {}

    openDialog(data: { message: string }): any {
        if (this.isDialogOpen) {
            return false;
        }
        this.isDialogOpen = true;
        const dialogRef = this.dialog.open(ErrorPopupComponent, {
            width: '30rem',
            panelClass: 'jo-error-popup',
            data,
        });
        dialogRef
            .afterClosed()
            .pipe(tap(() => (this.isDialogOpen = false)))
            .subscribe();
    }
}
