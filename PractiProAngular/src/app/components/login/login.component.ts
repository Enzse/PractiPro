import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JwtService } from '../../services/jwt.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router, private jwtservice: JwtService) {
    sessionStorage.clear();
  }

  //FormBuilder
  loginform = this.builder.group({
    email: this.builder.control('', Validators.required),
    password: this.builder.control('', Validators.required)
  })

  onLogin2() {

    this.service.proceedLogin(this.loginform.value).subscribe((res: any) => {
      if (res.token) {
        sessionStorage.setItem('token', res.token);
        console.clear();
        switch (this.jwtservice.getUserRole()) {
          case 'admin':
            this.router.navigate(['admin-users']);
            break;
          case 'student':
            this.router.navigate(['student-dashboard']);
            break;
          case 'coordinator':
            this.router.navigate(['coord-submissions']);
            break;
          default:
            alert("User's role is unassigned, please contact admin to resolve this issue.")
        }
      } else {
        alert("Invalid Credentials, please try again.");
      }
    }, error => {
      if(error.status == 401){
        alert("Invalid Credentials. Please try again.");
      };
      if(error.status == 403){
        alert("User is inactive. Please contact the admin for support.");
      };
      if(error.status == 404){
        alert("User does not exist. Please try again.");
      };
    });
  }
}







