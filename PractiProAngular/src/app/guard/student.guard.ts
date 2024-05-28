import { CanActivateChildFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const studentGuard: CanActivateChildFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

  const router: Router = inject(Router);
  const service: AuthService = inject(AuthService);

  if (service.IsLoggedIn()) {
    if (service.GetUserRole() === 'student') {
      return true;
    }
    else {
      router.navigate(['login']);
      alert("You don't have access to this page.");
      return false;
    }
  } else {
    router.navigate(['login']);
    alert("Unauthorized Access. (Really? Did you seriously think that would work?)");
    return false;
  }


};
