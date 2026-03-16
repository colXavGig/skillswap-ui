import { Component, computed, inject, signal } from '@angular/core';
import { Job, JobService } from '../../../service/job-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-postings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-postings.html',
  styleUrl: './my-postings.scss',
})
export class MyPostingsComponent {
  readonly #jobService = inject(JobService);

  jobs = signal<Job[]>([]);
  error = signal<string | null>(null);
  loaded = signal(false);
  isLoading = computed(() => !this.loaded() && this.error() === null);

  constructor() {
    this.#jobService.getMyPostings().subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.loaded.set(true);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load your job postings.');
      },
    });
  }
}
