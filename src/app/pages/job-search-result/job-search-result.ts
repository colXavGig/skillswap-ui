import { Component, computed, inject, signal } from '@angular/core';
import { Job, JobService, JobStatus } from '../../service/job-service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MinBudgetError } from '../../service/job-errors';

@Component({
  selector: 'app-job-search-result',
  imports: [RouterLink],
  templateUrl: './job-search-result.html',
  styleUrl: './job-search-result.scss',
})
export class JobSearchResult {
  readonly #jobService = inject(JobService);
  readonly #route = inject(ActivatedRoute);

  jobs = signal<Job[]>([]);
  error = signal<string | null>(null);
  loaded = signal(false);
  isLoading = computed(() => !this.loaded() && this.error() === null);

  ngOnInit() {
    const pathQueryParams = this.#route.snapshot.queryParams;

    const statusParam = pathQueryParams['status'];
    const status: JobStatus = statusParam === 'in_progress' || statusParam === 'completed' || statusParam === 'open'
      ? statusParam
      : 'open';
    const category = typeof pathQueryParams['category'] === 'string' && pathQueryParams['category'].trim().length > 0
      ? pathQueryParams['category'].trim()
      : undefined;
    const minBudgetParam = pathQueryParams['min_budget'];
    const min_budget = minBudgetParam === undefined || minBudgetParam === null || minBudgetParam === ''
      ? undefined
      : Number(minBudgetParam);

    this.#jobService.searchJobs({ status, category, min_budget })
    .subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loaded.set(true);
      },
      error: (err) => {
        if (err instanceof MinBudgetError) {
          this.error.set(`Requested minimum budget is invalid: ${minBudgetParam || 'none provided'}.`);
        } else {
          this.error.set('An unknown error occurred');
        }
        this.loaded.set(true);
      }
    });
  }
}
