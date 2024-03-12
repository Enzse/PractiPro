import { CanActivateFn } from '@angular/router';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})

export class authGuard implements CanActivate {
  constructor(private service: AuthService, private router: Router) {

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    if (this.service.IsLoggedIn()) {
      if (route.url.length > 0) {
        let menu = route.url[0].path;
        if (menu == 'users') {
          if (this.service.GetUserRole() === 'admin'){
            return true;
          } else {
            console.log("You don't have access.");
            this.router.navigate(['login']);
            return false;
          }
        } else {
          return true;
        }
      } else {
        return true;
      }

    } else {
      this.router.navigate(['login']);
      return false;
    }
  }
}
