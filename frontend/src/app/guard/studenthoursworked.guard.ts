import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import Swal from 'sweetalert2';
import { SessionService } from '../services/session.service';
import { StudentService } from '../services/api/student.service';


export const studenthoursworkedGuard: CanActivateFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const session = inject(SessionService);
  const studentApi = inject(StudentService);
  const router: Router = inject(Router);

  const userId: any = session.userId();
  return studentApi.ojtStatus(userId).pipe(
    map((res: any) => {
      const student = res.payload[0];
      if (student && student.TotalHoursWorked >= 200) {
        return true;
      } else {
        Swal.fire({
          title: 'Insufficient training hours.',
          text: "Only students who have met 200 total hours of training can access this page.",
          icon: 'warning',
        })
        router.navigate(['student-dashboard']);
        return false;
      }
    })
  );
}


