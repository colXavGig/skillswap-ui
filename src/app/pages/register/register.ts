import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../service/auth-service';
import { CommonModule } from '@angular/common';
import {
  EmailAlreadyInUseError,
  InvalidUsernameError,
  MissingRequiredFieldsError,
  RegisterError,
  UsernameAlreadyInUseError
} from '../../service/auth-errors';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  error = signal<string | null>(null);
  suggestedUsername = signal<string | null>(null);

  form = this.#fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    bio: ['', Validators.required],
    skills: ['', Validators.required],
  });

  ngOnInit() {
    this.form.valueChanges.subscribe(() => {
      this.error.set(null);
      this.suggestedUsername.set(null);
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    const skills = formValue.skills ? formValue.skills.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0) : [];

    const request: RegisterRequest = {
      name: formValue.name!,
      username: formValue.username!,
      email: formValue.email!,
      password: formValue.password!,
      bio: formValue.bio || '',
      skills: skills,
    };

    this.#authService.register(request)
      .subscribe({
        next: (response) => {
          if (response) {
            this.#router.navigate(['/login']);
          }
        },
        error: (err: RegisterError) => {
          console.error(err);
          this.error.set(err.message);
          this.suggestedUsername.set(null);

          if (err instanceof MissingRequiredFieldsError || err instanceof InvalidUsernameError || err instanceof EmailAlreadyInUseError) {
            // Error already set by default
          } else if (err instanceof UsernameAlreadyInUseError) {
            this.suggestedUsername.set(err.suggested_username || null);
          } else {
            this.error.set('An unknown error occurred.');
          }
        }
      });
  }
}
