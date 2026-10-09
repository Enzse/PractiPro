import { CanActivateChildFn, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';

export const coordGuard: CanActivateChildFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const session = inject(SessionService);

  const router: Router = inject(Router);

  if (session.isLoggedIn()) {
    if (session.role() === 'advisor') {
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
