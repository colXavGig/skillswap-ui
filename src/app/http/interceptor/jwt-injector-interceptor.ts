import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInjectorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
