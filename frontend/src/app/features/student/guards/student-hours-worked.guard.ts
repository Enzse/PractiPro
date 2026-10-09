import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { REQUIRED_TRAINING_HOURS } from '../student-status.service';

/** The final report, open once the student has rendered the required training hours. */
export const studentHoursWorkedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return inject(StudentService).ojtStatus(inject(SessionService).requireUserId()).pipe(
    map((res) => {
      if (Number(res.payload[0]?.TotalHoursWorked ?? 0) >= REQUIRED_TRAINING_HOURS) {
        return true;
      }
      toast.warning('Not available yet', `The final report opens at ${REQUIRED_TRAINING_HOURS} approved training hours.`);
      return router.createUrlTree(['/student/dashboard']);
    }),
  );
};
