import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorPopupService } from '../shared/error-popup/error-popup.service';
import { UserService } from './user.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
    constructor(
        private readonly userService: UserService,
        private readonly errorPopupService: ErrorPopupService,
        private readonly router: Router
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return from(this.userService.getUserIdToken()).pipe(
            switchMap(token => {
                if (token) {
                    req = req.clone({ headers: req.headers.set('Authorization', token) });
                }
                if (!req.headers.has('Content-Type')) {
                    req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
                }
                req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
                return next.handle(req);
            })
        );
    }
}
