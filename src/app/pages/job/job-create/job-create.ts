import { Component, inject, OnInit, signal } from '@angular/core';
import { JobService } from '../../../service/job-service';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    title: [''],
    description: [''],
    budget: [0],
    category: ['']
  });
  
  feedbackMsg = signal<string | null>(null);
  
  
  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      this.feedbackMsg.set(null);
    });
  }

  createJob() {
    if (this.form.invalid) {
      return;
    }

    const { title, description, budget, category } = this.form.value;
    this.#jobService.create({
      title: title || '',
      description: description || '',
      budget: budget || -1,
      category: category || ''
    }).subscribe({
      next: (response) => {
        this.feedbackMsg.set('Job created successfully!');
      },
      error: (error) => {
        console.error('Error creating job:', error);
      }
    });
  }
}
