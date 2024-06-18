import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';
import Swal from 'sweetalert2';


export const studenthoursworkedGuard: CanActivateFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router: Router = inject(Router);
  const service: AuthService = inject(AuthService);

  const userId: any = service.getCurrentUserId();
  console.log(userId)
  return service.getStudentOjtInfo(userId).pipe(
    map((res: any) => {
      const student = res.payload[0];
      console.log(student);
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


