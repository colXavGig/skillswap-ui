import { Component, computed, inject, signal } from '@angular/core';
import { Job, JobService, JobStatus } from '../../service/job-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  readonly #router = inject(Router);

  jobs = signal<Job[]>([]);
  error = signal<string | null>(null);
  isLoading = computed(() => this.error() === null && this.jobs().length === 0);

  ngOnInit() {
    const pathQueryParams = this.#route.snapshot.queryParams;

    const status: JobStatus = pathQueryParams['status'] || 'open';
    const category = pathQueryParams['category'] || undefined;
    const min_budget = pathQueryParams['min_budget'] || undefined;

    this.#jobService.searchJobs({ status, category, min_budget })
    .subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
      },
      error: (err) => {
        switch (err) {
          case MinBudgetError: 
            this.error.set(`Resquested minimum budget is invalid: ${min_budget || 'none provided'}}`)
            break;
          default:
            this.error.set('An unknown error occurred');
            break;
        }
      }
    });
  }
}
