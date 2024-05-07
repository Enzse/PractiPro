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

        switch (this.jwtservice.getUserRole()) {
          case 'admin':
            this.router.navigate(['admin-users']);
            break;
          case 'student':
            this.router.navigate(['student-dashboard']);
            break;
          default:
            alert("User's role is unassigned, please contact admin to resolve this issue.")
        }
      } else {
        alert("Invalid Credentials, please try again.");
      }
    });
  }
}

//WALA NA TO

// userdata: any;
// onLogin() {
//   this.service.getUser(this.loginform.value.email).subscribe(res => {
//     this.userdata = res;
//     console.log(this.userdata);
//     if (this.userdata.payload.length > 0) {
//       const user = this.userdata.payload[0];
//       if (user.password === this.loginform.value.password) {
//         if (user.isActive) {
//           sessionStorage.setItem('email', user.email);
//           sessionStorage.setItem('userrole', user.role);
//           if (this.service.GetUserRole() === 'admin') {
//             this.router.navigate(['users']);
//           } else if (this.service.GetUserRole() === 'student') {
//             this.router.navigate(['dashboard']);
//           }
//         } else {
//           alert("Inactive user. Please contact admin.");
//           // this.inactive = true;
//         }
//       } else {
//         alert("Invalid credentials!");
//       }
//     } else {
//       alert("User not found!");
//     }
//   });
// }





