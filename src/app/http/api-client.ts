import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { inject, Injectable } from "@angular/core"
import { catchError, Observable, throwError } from "rxjs"

export interface ApiErrorResponse {
  error: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiClient {

    readonly #BASE_URL = 'https://stingray-app-wxhhn.ondigitalocean.app'
    readonly #httpClient = inject(HttpClient)

    get<T>(path: string): Observable<T>  {
        return this.#httpClient.get<T>(`${this.#BASE_URL}${path}`).pipe(
            catchError(this.handleError)
        );
    }

    post<T>(path: string, body: unknown): Observable<T> {
        return this.#httpClient.post<T>(`${this.#BASE_URL}${path}`, body).pipe(
            catchError(this.handleError)
        );
    }

    patch<T>(path: string, body: unknown): Observable<T> {
        return this.#httpClient.patch<T>(`${this.#BASE_URL}${path}`, body).pipe(
            catchError(this.handleError)
        );
    }

    delete<T>(path: string): Observable<T> {
        return this.#httpClient.delete<T>(`${this.#BASE_URL}${path}`).pipe(
            catchError(this.handleError)
        );
    }

    private handleError = (error: HttpErrorResponse | ApiError) => {
        if (error instanceof ApiError) {
          return throwError(() => error);
        }
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${JSON.stringify(error.error)}`);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new ApiError(error.error, error.status));
    }
}

export class ApiError extends Error implements ApiErrorResponse {
  error: string;
  status: number;
  suggested_username?: string;


  constructor(resp: ApiErrorResponse | string, status: number) {
    const errorMsg = typeof resp === 'string' ? resp : resp.error;
    super(errorMsg);
    this.error = errorMsg;
    this.status = status;
    if (typeof resp === 'object' && resp !== null) {
      this.suggested_username = (resp as any).suggested_username;
    }
  }

}
