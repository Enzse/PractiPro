import { CanActivateFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';
import Swal from 'sweetalert2';


export const studentclassGuard: CanActivateFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router: Router = inject(Router);
    const service: AuthService = inject(AuthService);

    const userId: any = service.getCurrentUserId();
    return service.getStudentOjtInfo(userId).pipe(
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
                router.navigate(['student-join-classes']);
                return false;
            }
        })
    );
}


