import { Component, computed, inject, signal } from '@angular/core';
import { User, UserService } from '../../service/user-service';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { UserNotFoundError } from '../../service/user-errors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  readonly #userService = inject(UserService);
  readonly #route = inject(ActivatedRoute);

  user = signal<User | null>(null);
  error = signal<string | null>(null);
  // if there is no error and no user, the page is stil loading
  isLoading = computed(() => this.user() === null && this.error() === null); 

  constructor() {
    // get username param in the url. should be empty for /me
    const username = this.#route.snapshot.paramMap.get('username'); 

    const request$ = username 
      ? this.#userService.getUserByUsername(username)
      : this.#userService.getMe();

    request$
      .subscribe({
        next: (userData) => this.user.set(userData),
        error: (err) => {
          if (err instanceof UserNotFoundError) {
            this.error.set('User not found');
          } else {
            this.error.set('An unexpected error occurred');
          }
        },
      });
  }

}
