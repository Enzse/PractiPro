import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Practicum pages, open once all of the student's requirements are approved. */
export const studentRequirementsGuard: CanActivateFn = () => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return inject(StudentService).ojtStatus(inject(SessionService).requireUserId()).pipe(
    map((res) => {
      if (res.payload[0]?.registration_status === 1) {
        return true;
      }
      toast.warning('Not available yet', 'This page opens once all your requirements are approved.');
      return router.createUrlTree(['/student/dashboard']);
    }),
  );
};
