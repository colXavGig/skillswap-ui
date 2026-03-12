import { Component, inject, signal } from '@angular/core';
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
export class RegisterComponent {
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
    bio: [''],
    skills: [''],
  });

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();

    const skills = formValue.skills ? formValue.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0) : [];

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

          switch (err.constructor) {
            case MissingRequiredFieldsError:
            case InvalidUsernameError:
            case EmailAlreadyInUseError:
              break;
            case UsernameAlreadyInUseError:
              this.suggestedUsername.set((err as UsernameAlreadyInUseError).suggested_username || null);
              break;
            default:
              this.error.set('An unknown error occurred.');
              break;
          }
        }
      });
  }
}
