import { RouterLink } from '@angular/router';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Job, JobService, JobStatus, UpdateJobRequest } from '../../../service/job-service';
import {
  InvalidStatusError,
  JobAccessForbiddenError,
  JobNotFoundError,
  MustBeInProgressError,
  NoValidFieldsToUpdateError,
} from '../../../service/job-errors';
import { Proposal, ProposalService } from '../../../service/proposal-service';
import { ReviewService } from '../../../service/review-service';
import { AuthStore } from '../../../auth/auth-store';
import {
  AlreadyHasPendingProposalError,
  CannotSubmitToOwnJobError,
  JobNotOpenForProposalError,
} from '../../../service/proposal-errors';
import { AlreadyReviewedError } from '../../../service/review-errors';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './job-detail.html',
  styleUrl: './job-detail.scss',
})
export class JobDetailComponent implements OnInit {
  readonly #route = inject(ActivatedRoute);
  readonly #fb = inject(FormBuilder);
  readonly #jobService = inject(JobService);
  readonly #proposalService = inject(ProposalService);
  readonly #reviewService = inject(ReviewService);
  readonly #authStore = inject(AuthStore);

  job = signal<Job | null>(null);
  proposals = signal<Proposal[]>([]);
  error = signal<string | null>(null);
  isLoading = computed(() => this.job() === null && this.error() === null);

  readonly currentUserId = this.#authStore.user?.id;
  readonly isAuthenticated = this.#authStore.isAuthentificated();

  isOwner = computed(() => {
    const j = this.job();
    return j !== null && j.owner_id === this.currentUserId;
  });

  isAssignedFreelancer = computed(() => {
    const j = this.job();
    return j !== null && j.freelancer_id != null && j.freelancer_id === this.currentUserId;
  });

  isParticipant = computed(() => this.isOwner() || this.isAssignedFreelancer());

  reviewTargetId = computed(() => {
    const j = this.job();
    if (!j) return null;
    if (this.isOwner()) return j.freelancer_id ?? null;
    if (this.isAssignedFreelancer()) return j.owner_id;
    return null;
  });

  // Owner update form
  updateForm = this.#fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    budget: [null as number | null, [Validators.required, Validators.min(1)]],
    category: ['', Validators.required],
    status: ['open' as JobStatus, Validators.required],
  });
  updateError = signal<string | null>(null);
  updateSuccess = signal<string | null>(null);

  // Proposal form (for freelancers)
  proposalForm = this.#fb.group({
    price: [null as number | null, [Validators.required, Validators.min(1)]],
    cover_letter: ['', Validators.required],
  });
  proposalError = signal<string | null>(null);
  proposalSuccess = signal<string | null>(null);

  // Review form
  reviewForm = this.#fb.group({
    rating: [null as number | null, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: [''],
  });
  reviewError = signal<string | null>(null);
  reviewSuccess = signal<string | null>(null);

  // Complete job
  completeError = signal<string | null>(null);
  completeSuccess = signal<string | null>(null);

  // Accept proposal
  acceptError = signal<string | null>(null);

  ngOnInit() {
    this.updateForm.valueChanges.subscribe(() => {
      this.updateError.set(null);
      this.updateSuccess.set(null);
    });

    const jobId = this.getJobIdFromRoute();
    if (!jobId) {
      this.error.set('Invalid job ID.');
      return;
    }

    this.#jobService.getJobById(jobId).subscribe({
      next: (job) => {
        this.applyLoadedJob(job);
        // If owner, load proposals
        if (job.owner_id === this.currentUserId) {
          this.#proposalService.getJobProposals(jobId).subscribe({
            next: (proposals) => this.proposals.set(proposals),
            error: () => {}, // proposals list is non-critical
          });
        }
      },
      error: (err) => {
        if (err instanceof JobNotFoundError) {
          this.error.set('Job not found.');
        } else {
          this.error.set('Failed to load job details.');
        }
      },
    });
  }

  private getJobIdFromRoute(): string | null {
    const id = this.#route.snapshot.paramMap.get('id');
    if (!id || id.trim().length === 0) {
      return null;
    }

    return id;
  }

  private applyLoadedJob(job: Job) {
    this.job.set(job);
    this.updateForm.patchValue({
      title: job.title,
      description: job.description,
      budget: job.budget,
      category: job.category,
      status: job.status,
    });
  }

  acceptProposal(proposal: Proposal) {
    this.acceptError.set(null);
    const jobId = this.getJobIdFromRoute();

    if (!jobId) {
      this.acceptError.set('Invalid job ID.');
      return;
    }

    this.#proposalService.acceptProposal(proposal.id).subscribe({
      next: () => {
        // Update proposals list optimistically
        this.proposals.update((prev) =>
          prev.map((p) =>
            p.id === proposal.id
              ? { ...p, status: 'accepted' as const }
              : p.status === 'pending'
                ? { ...p, status: 'rejected' as const }
                : p
          )
        );
        // Reload job to get updated status and freelancer_id
        this.#jobService.getJobById(jobId).subscribe({
          next: (job) => this.applyLoadedJob(job),
          error: () => {},
        });
      },
      error: (err) => {
        this.acceptError.set(err.message || 'Failed to accept proposal.');
      },
    });
  }

  submitProposal() {
    if (this.proposalForm.invalid) return;
    this.proposalError.set(null);
    this.proposalSuccess.set(null);

    const jobId = this.getJobIdFromRoute();
    if (!jobId) {
      this.proposalError.set('Invalid job ID.');
      return;
    }

    const { price, cover_letter } = this.proposalForm.value;

    this.#proposalService
      .submitProposal(jobId, { price: price!, cover_letter: cover_letter! })
      .subscribe({
        next: () => {
          this.proposalSuccess.set('Your proposal has been submitted!');
          this.proposalForm.reset({ price: null, cover_letter: '' });
        },
        error: (err) => {
          if (err instanceof CannotSubmitToOwnJobError) {
            this.proposalError.set('You cannot submit a proposal to your own job.');
          } else if (err instanceof AlreadyHasPendingProposalError) {
            this.proposalError.set('You already have a pending proposal for this job.');
          } else if (err instanceof JobNotOpenForProposalError) {
            this.proposalError.set('This job is no longer accepting proposals.');
          } else {
            this.proposalError.set(err.message || 'Failed to submit proposal.');
          }
        },
      });
  }

  updateJob() {
    const currentJob = this.job();
    if (!currentJob) {
      return;
    }

    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      return;
    }

    this.updateError.set(null);
    this.updateSuccess.set(null);

    const { title, description, budget, category, status } = this.updateForm.getRawValue();
    const normalizedTitle = title?.trim() || '';
    const normalizedDescription = description?.trim() || '';
    const normalizedCategory = category?.trim() || '';

    const patch: UpdateJobRequest = {};
    if (normalizedTitle !== currentJob.title) {
      patch.title = normalizedTitle;
    }
    if (normalizedDescription !== currentJob.description) {
      patch.description = normalizedDescription;
    }
    if (budget != null && budget !== currentJob.budget) {
      patch.budget = budget;
    }
    if (normalizedCategory !== currentJob.category) {
      patch.category = normalizedCategory;
    }
    if (status && status !== currentJob.status) {
      patch.status = status;
    }

    if (Object.keys(patch).length === 0) {
      this.updateError.set('No changes detected.');
      return;
    }

    this.#jobService.update(currentJob.id, patch).subscribe({
      next: () => {
        this.updateSuccess.set('Job updated successfully.');
        this.applyLoadedJob({ ...currentJob, ...patch });
      },
      error: (err) => {
        if (err instanceof NoValidFieldsToUpdateError) {
          this.updateError.set('No valid fields were provided for update.');
        } else if (err instanceof InvalidStatusError) {
          this.updateError.set('Selected status is invalid.');
        } else if (err instanceof JobAccessForbiddenError) {
          this.updateError.set('You are not allowed to update this job.');
        } else {
          this.updateError.set(err.message || 'Failed to update job.');
        }
      },
    });
  }

  completeJob() {
    this.completeError.set(null);
    this.completeSuccess.set(null);
    const jobId = this.getJobIdFromRoute();

    if (!jobId) {
      this.completeError.set('Invalid job ID.');
      return;
    }

    this.#jobService.complete(jobId).subscribe({
      next: () => {
        this.completeSuccess.set('Job marked as completed!');
        const currentJob = this.job();
        if (currentJob) {
          this.applyLoadedJob({ ...currentJob, status: 'completed' });
        }
      },
      error: (err) => {
        if (err instanceof MustBeInProgressError) {
          this.completeError.set('Only in-progress jobs can be completed.');
        } else if (err instanceof JobAccessForbiddenError) {
          this.completeError.set('You are not authorized to complete this job.');
        } else {
          this.completeError.set(err.message || 'Failed to complete job.');
        }
      },
    });
  }

  submitReview() {
    if (this.reviewForm.invalid) return;
    this.reviewError.set(null);
    this.reviewSuccess.set(null);

    const jobId = this.getJobIdFromRoute();
    const targetId = this.reviewTargetId();
    const { rating, comment } = this.reviewForm.value;

    if (!jobId) {
      this.reviewError.set('Invalid job ID.');
      return;
    }

    if (!targetId) {
      this.reviewError.set('Cannot determine review target.');
      return;
    }

    this.#reviewService
      .submitReview(jobId, {
        target_id: targetId,
        rating: rating!,
        comment: comment || undefined,
      })
      .subscribe({
        next: () => {
          this.reviewSuccess.set('Review submitted successfully!');
          this.reviewForm.reset();
        },
        error: (err) => {
          if (err instanceof AlreadyReviewedError) {
            this.reviewError.set('You have already submitted a review for this job.');
          } else {
            this.reviewError.set(err.message || 'Failed to submit review.');
          }
        },
      });
  }
}
