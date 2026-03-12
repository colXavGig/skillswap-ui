import { inject, Injectable } from '@angular/core';
import { ApiClient, ApiError } from '../http/api-client';
import { catchError, Observable, throwError } from 'rxjs';
import { UserModel } from '../model/user';
import { UserNotFoundError } from './user-errors';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly #BASE_ENDPOINT = '/users';
  readonly #apiClient: ApiClient = inject(ApiClient);

  getMe(): Observable<UserModel> {
    return this.#apiClient.get<UserModel>(`${this.#BASE_ENDPOINT}/me`).pipe(
      catchError((err: ApiError) => {
        if (err.status === 404) {
          throw new UserNotFoundError(err.error);
        }
        return throwError(() => err);
      }),
    );
  }

  getUserByUsername(username: string): Observable<UserModel> {
    return this.#apiClient
      .get<UserModel>(`${this.#BASE_ENDPOINT}/${username}`)
      .pipe(
        catchError((err: ApiError) => {
          if (err.status === 404) {
            throw new UserNotFoundError(err.error);
          }
          return throwError(() => err);
        }),
      );
  }
}
