import { inject, Injectable } from '@angular/core';
import { ApiClient, ApiError } from '../http/api-client';
import { catchError, NEVER, Observable, tap, throwError } from 'rxjs';
import { InvalidStatusError, JobAccessForbiddenError, JobNotFoundError, MinBudgetError, MissingRequiredFieldsError, MustBeInProgressError, NoValidFieldsToUpdateError } from './job-errors';
import { AuthStore } from '../auth/auth-store';

export type JobStatus = 'open' | 'in_progress' | 'completed';

export interface Job {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  budget: number;
  status: JobStatus;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  budget: number;
  category: string;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  budget?: number;
  category?: string;
  status?: JobStatus;
}


export interface SearchJobsRequest {
  category?: string;
  status?: JobStatus ; // default should be open
  min_budget?: number;
}

@Injectable({
  providedIn: 'root',
}) 
export class JobService {

  readonly #BASE_ENDPOINT = '/jobs';
  readonly #apiClient = inject(ApiClient);
  readonly #authStore = inject(AuthStore);

  /**
   * 
   * @param {SearchJobsRequest} queryParams 
   * @throws {MinBudgetError}
   * @returns {Observable<Job[]>}
   */
  searchJobs(queryParams: SearchJobsRequest): Observable<Job[]> {
    if (!queryParams.status) {
      // default to open
      queryParams.status = 'open';
    }

    return this.#apiClient.post<Job[]>(`${this.#BASE_ENDPOINT}/search`, queryParams)
    .pipe(
      catchError((err: ApiError) => {
        if (err.status === 400) {
          throw new MinBudgetError(err.error);
        }
        return throwError(() => err);
      }),
    );
  }

  create(job: CreateJobRequest): Observable<void> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.post<void>(`${this.#BASE_ENDPOINT}`, job)
    .pipe(
      catchError((err: ApiError) => {
        if (err.status === 400) {
          throw new MissingRequiredFieldsError(err.error);
        }
        return throwError(() => err);
      })
    );
  }

  getJobById(id: number): Observable<Job> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.get<Job>(`${this.#BASE_ENDPOINT}/${id}`)
    .pipe(
      catchError((err: ApiError) => {
        if (err.status === 404) {
          throw new JobNotFoundError(err.error);
        }
        return throwError(() => err);
      })
    );
  }

  update(id: number, patch: UpdateJobRequest): Observable<void> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.patch<void>(`${this.#BASE_ENDPOINT}/${id}`, patch)
    .pipe(
      catchError((err: ApiError) => {
        switch (err.status) {
          case 400:
            if (err.error === 'Invalid status') {
              throw new InvalidStatusError(err.error);
            } 
            if (err.error === 'No valid fields to update') {
              throw new NoValidFieldsToUpdateError(err.error);
            }
            throw err;
          case 403: // connected user is not the owner
            throw new JobAccessForbiddenError(err.error);
          case 404:
            throw new JobNotFoundError(err.error);
          default:
            throw err;
        }
      })
    );
  }

  getMyPostings(): Observable<Job[]> {

    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.get<Job[]>(`${this.#BASE_ENDPOINT}/my-postings`)
  }

  complete(job_id: number): Observable<void> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.patch<void>(`${this.#BASE_ENDPOINT}/${job_id}/complete`, null)
    .pipe(
      catchError((err: ApiError) => {
        switch (err.status) {
          case 400: 
            throw new MustBeInProgressError(err.error);
          case 403:
            throw new JobAccessForbiddenError(err.error);
          case 404:
            throw new JobNotFoundError(err.error);
          default:
            throw err;
        }
      })
    );
  }
}
