import { inject, Injectable } from '@angular/core';
import { ApiClient, ApiError } from '../http/api-client';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { User } from './user-service';
import { AuthStore } from '../auth/auth-store';
import {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  InvalidUsernameError, LoginMissingFieldsError, MissingRequiredFieldsError,
  UsernameAlreadyInUseError
} from './auth-errors';

// --- Request/Response Interfaces ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  bio: string;
  skills: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly #BASE_ENDPOINT = '/auth';
  readonly #apiClient: ApiClient = inject(ApiClient);
  readonly #authStore = inject(AuthStore);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.#apiClient.post<AuthResponse>(`${this.#BASE_ENDPOINT}/login`, credentials)
      .pipe(
        catchError((err: ApiError) => {
          if (err.status === 401) {
            throw new InvalidCredentialsError(err.error);
          }
          if (err.status === 400) {
            throw new LoginMissingFieldsError(err.error);
          }
          return throwError(() => err);
        }),
        tap({
          next: response => {
            this.#authStore.saveSession(response.user, response.token);
          }
        })
      );
  }

  register(user: RegisterRequest): Observable<RegisterResponse> {
    return this.#apiClient.post<RegisterResponse>(`${this.#BASE_ENDPOINT}/register`, user)
      .pipe(
        catchError((err: ApiError) => {
          if (err.status === 400) {
            if (err.error === 'Missing required fields') {
              throw new MissingRequiredFieldsError(err.error);
            }
            if (err.error === 'Invalid username') {
              throw new InvalidUsernameError(err.error);
            }
          }
          if (err.status === 409) {
            if (err.error === 'Email already in use') {
              throw new EmailAlreadyInUseError(err.error);
            }
            if (err.error === 'Username already in use') {
              throw new UsernameAlreadyInUseError(err);
            }
          }
          return throwError(() => err);
        })
      );
  }
}
