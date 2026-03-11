import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../auth/auth-store';



export const jwtInjectorInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);

  if (authStore.isAuthentificated()) {
    const token = authStore.token;
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("token injected");
  }

  return next(req);
};
