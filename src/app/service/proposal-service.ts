import { inject, Injectable } from '@angular/core';
import { ApiClient, ApiError } from '../http/api-client';
import { catchError, NEVER, Observable, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth-store';
import {
  AlreadyHasPendingProposalError,
  CannotAcceptOwnProposalError,
  CannotSubmitToOwnJobError,
  JobNoLongerOpenError,
  JobNotFoundError,
  JobNotOpenForProposalError,
  MissingProposalFieldsError,
  OnlyPendingCanBeDeletedError,
  ProposalForbiddenError,
  ProposalNotFoundError,
} from './proposal-errors';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface ProposalFreelancer {
  id: string;
  name: string;
  rating_avg: number;
  username: string;
}

export interface Proposal {
  id: string;
  job_id: string;
  freelancer_id: string;
  freelancer?: ProposalFreelancer;
  price: number;
  cover_letter: string;
  status: ProposalStatus;
  job_title?: string;
}

export interface CreateProposalRequest {
  price: number;
  cover_letter: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProposalService {
  readonly #apiClient = inject(ApiClient);
  readonly #authStore = inject(AuthStore);

  getJobProposals(jobId: string): Observable<Proposal[]> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.get<Proposal[]>(`/jobs/${jobId}/proposals`).pipe(
      catchError((err: ApiError) => {
        if (err.status === 404) throw new JobNotFoundError(err.error);
        if (err.status === 403) throw new ProposalForbiddenError(err.error);
        return throwError(() => err);
      })
    );
  }

  submitProposal(jobId: string, req: CreateProposalRequest): Observable<Proposal> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.post<Proposal>(`/jobs/${jobId}/proposals`, req).pipe(
      catchError((err: ApiError) => {
        switch (err.status) {
          case 404:
            throw new JobNotFoundError(err.error);
          case 403:
            throw new CannotSubmitToOwnJobError(err.error);
          case 400:
            if (err.error === 'Proposals are allowed only for open jobs') {
              throw new JobNotOpenForProposalError(err.error);
            }
            throw new MissingProposalFieldsError(err.error);
          case 409:
            throw new AlreadyHasPendingProposalError(err.error);
          default:
            return throwError(() => err);
        }
      })
    );
  }

  acceptProposal(proposalId: string): Observable<void> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.patch<void>(`/proposals/${proposalId}/accept`, null).pipe(
      catchError((err: ApiError) => {
        switch (err.status) {
          case 404:
            throw new ProposalNotFoundError(err.error);
          case 403:
            if (err.error === 'You cannot accept your own proposal') {
              throw new CannotAcceptOwnProposalError(err.error);
            }
            throw new ProposalForbiddenError(err.error);
          case 400:
            throw new JobNoLongerOpenError(err.error);
          default:
            return throwError(() => err);
        }
      })
    );
  }

  getMyBids(): Observable<Proposal[]> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.get<Proposal[]>(`/proposals/my-bids`);
  }

  deleteProposal(proposalId: string): Observable<void> {
    if (!this.#authStore.isAuthentificated()) {
      return NEVER;
    }

    return this.#apiClient.delete<void>(`/proposals/${proposalId}`).pipe(
      catchError((err: ApiError) => {
        switch (err.status) {
          case 404:
            throw new ProposalNotFoundError(err.error);
          case 403:
            throw new ProposalForbiddenError(err.error);
          case 400:
            throw new OnlyPendingCanBeDeletedError(err.error);
          default:
            return throwError(() => err);
        }
      })
    );
  }
}
