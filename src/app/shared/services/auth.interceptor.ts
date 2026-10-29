// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionState } from '../../core/auth/session-state';
import { isCenterApi } from '../../core/auth/api-policy';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isCenterApi(req.url)) return next(req);
  const session = inject(SessionState);
  const login = req.url.endsWith('/login');
  const token = session.token();
  const request = req.clone({ withCredentials: true,
    ...(token && !login ? { setHeaders: { Authorization: `Bearer ${token}` } } : {}) });
  return next(request).pipe(catchError(error => {
    if (error.status === 401 && !login) session.expire();
    return throwError(() => error);
  }));
};
