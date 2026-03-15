import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobStatus, SearchJobsRequest } from '../../service/job-service';

@Component({
  selector: 'app-job-search-form',
  imports: [ReactiveFormsModule],
  templateUrl: './job-search-form.html',
  styleUrl: './job-search-form.scss',
})
export class JobSearchForm {
  readonly #fb = inject(FormBuilder);
  readonly #router = inject(Router);


  form = this.#fb.group({
    status: ['open'],
    category: [''],
    min_budget: [0, [Validators.min(0)]],
  });

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
