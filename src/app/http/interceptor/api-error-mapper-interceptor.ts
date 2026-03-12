import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';
import { ApiError } from '../api-client';

export const apiErrorMapperInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req)
  .pipe(
    catchError((err: HttpErrorResponse) => {
      console.error(err);
      throw new ApiError(err.error, err.status);
    })
  );
};
