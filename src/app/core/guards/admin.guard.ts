import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = auth.isLoggedIn();
  const role = auth.getRole();

  if (isLoggedIn && role === 'Admin') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};