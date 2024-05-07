import { HttpRequest, HttpHandler, HttpInterceptor, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';

export const customInterceptor: HttpInterceptorFn = (req, next) => {

  if (req.url.includes('login')) {
    // Don't attach token for login request
    return next(req);
  }

  const myToken = sessionStorage.getItem('token');
  
  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${myToken}`
    }
});
  

  return next(authorizedRequest);
};

