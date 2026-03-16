import { CanActivateFn } from '@angular/router';
import { AuthStore } from '../auth/auth-store';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const needAuthGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthentificated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl: state.url,
      error: 'Please log in to continue.',
    },
  });
};
