import { Component, computed, inject, signal } from '@angular/core';
import { User, UserService } from '../../service/user-service';
import { ActivatedRoute } from '@angular/router';
import { UserNotFoundError } from '../../service/user-errors';
import { CommonModule } from '@angular/common';
import { Review, ReviewService } from '../../service/review-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  readonly #userService = inject(UserService);
  readonly #reviewService = inject(ReviewService);
  readonly #route = inject(ActivatedRoute);

  user = signal<User | null>(null);
  error = signal<string | null>(null);
  reviews = signal<Review[]>([]);
  reviewsError = signal<string | null>(null);
  reviewsLoaded = signal(false);
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
        next: (userData) => {
          this.user.set(userData);
          this.#reviewService.getReviewsByUser(userData.id).subscribe({
            next: (reviews) => {
              this.reviews.set(reviews);
              this.reviewsLoaded.set(true);
            },
            error: (reviewError) => {
              this.reviewsError.set(reviewError?.message || 'Failed to load user reviews.');
              this.reviewsLoaded.set(true);
            },
          });
        },
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
