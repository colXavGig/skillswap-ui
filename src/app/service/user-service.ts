import { inject, Injectable } from '@angular/core';
import { ApiClient, ApiError } from '../http/api-client';
import { catchError, Observable, throwError } from 'rxjs';
import { UserNotFoundError } from './user-errors';

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  bio: string;
  skills: string[];
  rating_avg: number | null;
  completed_jobs: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly #BASE_ENDPOINT = '/users';
  readonly #apiClient: ApiClient = inject(ApiClient);

  getMe(): Observable<User> {
    return this.#apiClient.get<User>(`${this.#BASE_ENDPOINT}/me`).pipe(
      catchError((err: ApiError) => {
        if (err.status === 404) {
          throw new UserNotFoundError(err.error);
        }
        return throwError(() => err);
      }),
    );
  }

  getUserByUsername(username: string): Observable<User> {
    return this.#apiClient
      .get<User>(`${this.#BASE_ENDPOINT}/${username}`)
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
