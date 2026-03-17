import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from './auth/auth-store';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly #authStore = inject(AuthStore);
  readonly #router = inject(Router);
  protected readonly title = signal('skillswap-ui');

  get isAuthenticated() {
    return this.#authStore.isAuthentificated();
  }

  logout() {
    this.#authStore.clearSession();
    this.#router.navigate(['/login']);
  }
}
