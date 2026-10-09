import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import Swal from 'sweetalert2';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';


export const studentRequirementsGuard: CanActivateFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const session = inject(SessionService);
  const studentApi = inject(StudentService);
  const router: Router = inject(Router);

  const userId: any = session.userId();
  return studentApi.ojtStatus(userId).pipe(
    map((res: any) => {
      const student = res.payload[0];
      if (student && student.registration_status === 1) {
        return true;
      } else {
        Swal.fire({
          title: 'You are not registered.',
          text: "Please clear your registration status first to access this page.",
          icon: 'warning',
        })
        router.navigate(['/student/dashboard']);
        return false;
      }
    })
  );
}


