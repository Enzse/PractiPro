import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import Swal from 'sweetalert2';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';


export const studentClassGuard: CanActivateFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const session = inject(SessionService);
  const studentApi = inject(StudentService);
    const router: Router = inject(Router);

    const userId: any = session.userId();
    return studentApi.ojtStatus(userId).pipe(
        map((res: any) => {
            const student = res.payload[0];
            if (student && student.block) {
                return true;
            } else {
                Swal.fire({
                    title: "Let's get you set up first!",
                    text: "You need to join your respective class first in order to proceed.",
                    // icon: 'warning'
                    // footer: "(You can join classes via <b>class invitation</b> or <b>class join requests</b>.)"
                })
                router.navigate(['/student/join-classes']);
                return false;
            }
        })
    );
}


