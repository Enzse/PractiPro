import { Router, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const classjoinlinkGuard: CanActivateFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

    const router: Router = inject(Router);
    const service: AuthService = inject(AuthService);

    if (service.IsLoggedIn()) {
        if (service.GetUserRole() === 'student') {
            return true;
        }
        else {
            router.navigate(['login']);
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
