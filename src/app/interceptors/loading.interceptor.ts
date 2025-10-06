import { inject } from '@angular/core';
import { HttpRequest, HttpEvent } from '@angular/common/http';
import { HttpInterceptorFn, HttpHandlerFn } from '@angular/common/http';

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoadingService } from '../services/loading.service';

export const loadingInterceptorFn: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const loadingService = inject(LoadingService);
    loadingService.show();

    return next(req).pipe(
        finalize(() => loadingService.hide())
    );
};
