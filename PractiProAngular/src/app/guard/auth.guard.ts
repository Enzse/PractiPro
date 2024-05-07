import { CanActivateFn } from '@angular/router';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { JwtService } from '../services/jwt.service';


@Injectable({
  providedIn: 'root'
})

export class authGuard implements CanActivate {
  constructor(private service: AuthService, private router: Router, private jwtservice: JwtService) {

  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    if (this.jwtservice.IsLoggedIn()) {
      if (route.url.length > 0) {
        let menu = route.url[0].path;
        if (menu == 'users') {
          if (this.jwtservice.getUserRole() === 'admin'){
            return true;
          } else {
            console.log(this.jwtservice.getUserRole())
            this.router.navigate(['login']);
            alert("You don't have access.");
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
