import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../service/auth-service';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../auth/auth-store';
import { InvalidCredentialsError, LoginError, LoginMissingFieldsError } from '../../service/auth-errors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  readonly #fb = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #authStore = inject(AuthStore);

  error = signal<string | null>(null);

  form = this.#fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit() {
    this.#route.queryParams.subscribe(params => {
      this.error.set(params['error'] || null);
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const credentials: LoginRequest = {
      email: this.form.value.email!,
      password: this.form.value.password!,
    };

    this.#authService.login(credentials)
      .subscribe({
        next: (response) => {
          if (response) {
            this.#authStore.saveSession(response.user, response.token);
            const returnUrl = this.#route.snapshot.queryParams['returnUrl'] || '/';
            this.#router.navigateByUrl(returnUrl);
          }
        },
        error: (err: LoginError) => {
          console.error(err);
          switch (err.constructor) {
            case InvalidCredentialsError:
              this.error.set('Invalid email or password.');
              break;
            case LoginMissingFieldsError:
              this.error.set('Please fill in all fields.');
              break;
            default:
              this.error.set('An unknown error occurred.');
              break;
          }
        }
      });
  }
}
