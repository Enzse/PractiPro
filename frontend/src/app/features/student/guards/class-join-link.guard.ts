import { Router, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import Swal from 'sweetalert2';
import { SessionService } from '../../../core/auth/session.service';

export const classJoinLinkGuard: CanActivateFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const session = inject(SessionService);

    const router: Router = inject(Router);

    if (session.isLoggedIn()) {
        if (session.role() === 'student') {
            return true;
        }
        else {
            router.navigate(['/login']);
            alert("This page is for students only.");
            return false;
        }
    } else {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        Swal.fire({
            title: 'Login Required',
            text: 'Please log into your student account first in order to join the class through this link.',
            icon: 'warning'
        })
        return false;
    }


};
