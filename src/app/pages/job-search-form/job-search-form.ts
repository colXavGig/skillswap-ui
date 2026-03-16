import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobStatus, SearchJobsRequest } from '../../service/job-service';
import { PlatformService, PlatformStats } from '../../service/platform-service';

@Component({
  selector: 'app-job-search-form',
  imports: [ReactiveFormsModule],
  templateUrl: './job-search-form.html',
  styleUrl: './job-search-form.scss',
})
export class JobSearchForm implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #router = inject(Router);
  readonly #platformService = inject(PlatformService);

  stats = signal<PlatformStats | null>(null);
  statsError = signal<string | null>(null);


  form = this.#fb.group({
    status: ['open'],
    category: [''],
    min_budget: [0, [Validators.min(0)]],
  });

  ngOnInit() {
    this.#platformService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => this.statsError.set('Unable to load platform stats right now.'),
    });
  }

  formatCurrencyForStats(value: number): string {
    if (!Number.isFinite(value)) {
      return '$0';
    }

    const units = [
      { value: 1e30, label: 'nonillion' },
      { value: 1e27, label: 'octillion' },
      { value: 1e24, label: 'septillion' },
      { value: 1e21, label: 'sextillion' },
      { value: 1e18, label: 'quintillion' },
      { value: 1e15, label: 'quadrillion' },
      { value: 1e12, label: 'trillion' },
      { value: 1e9, label: 'billion' },
      { value: 1e6, label: 'million' },
    ];

    const absValue = Math.abs(value);

    for (const unit of units) {
      if (absValue >= unit.value) {
        const scaled = value / unit.value;
        const rounded =
          Math.abs(scaled) >= 100
            ? scaled.toFixed(0)
            : Math.abs(scaled) >= 10
              ? scaled.toFixed(1)
              : scaled.toFixed(2);
        const cleaned = rounded
          .replace(/\.0+$/, '')
          .replace(/(\.\d*[1-9])0+$/, '$1');
        return `$${cleaned} ${unit.label}`;
      }
    }

    return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)}`;
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const queryParams: SearchJobsRequest = {
      status: this.form.value.status as JobStatus || undefined,
      category: this.form.value.category || undefined,
      min_budget: this.form.value.min_budget || undefined,
    };

    this.#router.navigate(['/jobs/search-result'], { queryParams });
  }
}
