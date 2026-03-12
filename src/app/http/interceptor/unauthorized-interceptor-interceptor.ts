import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthStore } from '../../auth/auth-store';

export const unauthorizedInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);


  // verify if it is trying to register or login to keep passing the error through
  if (req.url.includes('register') || req.url.includes('login')) {
    return next(req);
  }

  return next(req).pipe(
    tap({
      error: (err) => {
        
        if (err.status === 401) {
          console.log("Unauthorized request detected", err);

          authStore.clearSession();

          router.navigate(['/login'], { queryParams: { 
            returnUrl: router.url,
            error: err.error?.error || 'Unauthorized access. Please log in.'
           }});
        }
      }
    })
  );
};
