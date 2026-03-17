import { inject, Injectable } from '@angular/core';
import { ApiClient, ApiError } from '../http/api-client';
import { catchError, NEVER, Observable, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth-store';
import {
  AlreadyReviewedError,
  CannotReviewYourselfError,
  InvalidRatingError,
  InvalidReviewTargetError,
  InvalidUserIdError,
  ReviewForbiddenError,
  ReviewJobNotFoundError,
  ReviewMissingFieldsError,
  ReviewNotAllowedJobNotCompletedError,
  ReviewTargetNotFoundError,
} from './review-errors';

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  target_id: string;
  rating: number;
  comment?: string;
}

export interface CreateReviewRequest {
  target_id: string;
  rating: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  readonly #apiClient = inject(ApiClient);
  readonly #authStore = inject(AuthStore);

  submitReview(jobId: string, req: CreateReviewRequest): Observable<void> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.post<void>(`/jobs/${jobId}/reviews`, req).pipe(
      catchError((err: ApiError) => {
        switch (err.status) {
          case 404:
            if (err.error === 'Target user not found') {
              throw new ReviewTargetNotFoundError(err.error);
            }
            throw new ReviewJobNotFoundError(err.error);
          case 400:
            if (err.error === 'Reviews are allowed only for completed jobs') {
              throw new ReviewNotAllowedJobNotCompletedError(err.error);
            }
            if (err.error === 'You cannot review yourself') {
              throw new CannotReviewYourselfError(err.error);
            }
            if (err.error === 'target_id must be the other participant') {
              throw new InvalidReviewTargetError(err.error);
            }
            if (err.error === 'rating must be an integer between 1 and 5') {
              throw new InvalidRatingError(err.error);
            }
            throw new ReviewMissingFieldsError(err.error);
          case 403:
            throw new ReviewForbiddenError(err.error);
          case 409:
            throw new AlreadyReviewedError(err.error);
          default:
            return throwError(() => err);
        }
      })
    );
  }

  getReviewsByUser(userId: string): Observable<Review[]> {
    return this.#apiClient.get<Review[]>(`/reviews/user/${userId}`).pipe(
      catchError((err: ApiError) => {
        if (err.status === 400) throw new InvalidUserIdError(err.error);
        return throwError(() => err);
      })
    );
  }
}
