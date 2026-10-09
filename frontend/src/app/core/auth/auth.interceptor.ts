import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SessionService } from './session.service';

/**
 * Attaches the login token to every API request, and sends the user back to
 * the login page when the API says their session is no longer valid.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const session = inject(SessionService);
  const token = session.token();

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const request = token && isApiRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // The API marks "you need to log in (again)" with WWW-Authenticate. Other
      // 401s, such as an expired join link, are left for the page to handle.
      if (isApiRequest && error.status === 401 && error.headers.get('WWW-Authenticate')) {
        session.clear();
        router.navigate(['login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    }),
  );
};
