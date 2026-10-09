import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../../../core/auth/session.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** The join-class link page: students only, signed in first (they come back here afterwards). */
export const classJoinLinkGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (!session.isLoggedIn()) {
    toast.info('Sign in to join the class', 'Use your student account; you will come back to this link afterwards.');
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  if (session.role() !== 'student') {
    toast.error('This link is for students', 'Sign in with a student account to join a class.');
    return router.createUrlTree(['/login']);
  }
  return true;
};
