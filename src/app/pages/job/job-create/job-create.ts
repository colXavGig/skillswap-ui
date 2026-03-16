import { Component, inject, OnInit, signal } from '@angular/core';
import { JobService } from '../../../service/job-service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MissingRequiredFieldsError } from '../../../service/job-errors';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-create.html',
  styleUrls: ['./job-create.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true
})
export class JobCreateComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #jobService = inject(JobService);
  readonly #router = inject(Router);
  
  
  form = this.#fb.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    budget: [null as number | null, [Validators.required, Validators.min(1)]],
    category: ['', [Validators.required]]
  });
  
  feedbackMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  isSubmitting = signal(false);
  
  
  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      this.feedbackMsg.set(null);
      this.errorMsg.set(null);
    });
  }

  createJob() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const { title, description, budget, category } = this.form.getRawValue();
    this.#jobService.create({
      title: title || '',
      description: description || '',
      budget: budget || -1,
      category: category || ''
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.feedbackMsg.set('Job created successfully!');
        this.form.reset({
          title: '',
          description: '',
          budget: null,
          category: ''
        });
        this.#router.navigate(['/jobs/my-postings']);
      },
      error: (error) => {
        this.isSubmitting.set(false);

        if (error instanceof MissingRequiredFieldsError) {
          this.errorMsg.set('Please fill in all required fields.');
          return;
        }

        this.errorMsg.set(error.message || 'Failed to create job.');
      }
    });
  }
}
