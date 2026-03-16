import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../api-client';

export const apiErrorMapperInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req)
  .pipe(
    catchError((err: HttpErrorResponse) => {
      console.error(err);
      if (err instanceof ApiError) {
        return throwError(() => err);
      }
      return throwError(() => new ApiError(err.error, err.status));
    })
  );
};
