import { CanActivateFn } from '@angular/router';
import { AuthStore } from '../auth/auth-store';
import { inject } from '@angular/core';

export const needAuthGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);

  return authStore.isAuthentificated();
};
