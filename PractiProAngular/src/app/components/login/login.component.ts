import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { JwtService } from '../../services/jwt.service';
import Swal from 'sweetalert2';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object, private jwtservice: JwtService) {
    sessionStorage.clear();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
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
          case 'superadmin':
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
        Swal.fire({
          title: "Error",
          text: "Invalid Credentials. Please try again.",
          icon: "error"
        });
      }
    }, error => {
      if (error.status == 401) {
        Swal.fire({
          title: "Error",
          text: "Invalid Credentials. Please try again.",
          icon: "error"
        });
      };
      if (error.status == 403) {
        Swal.fire({
          title: "Inactive User!",
          text: "Please contact admin for activation of your account.",
          icon: "warning"
        });
      };
      if (error.status == 404) {
        Swal.fire({
          title: "User does not exist!",
          text: "Please double check your entered email.",
          icon: "error"
        });
      };
    });
  }
}







