import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Pages that need the student to be in a class. */
export const studentClassGuard: CanActivateFn = () => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return inject(StudentService).ojtStatus(inject(SessionService).requireUserId()).pipe(
    map((res) => {
      if (res.payload[0]?.block) {
        return true;
      }
      toast.info('Join a class first', 'Accept an invitation from your coordinator or request to join a class.');
      return router.createUrlTree(['/student/join-classes']);
    }),
  );
};
