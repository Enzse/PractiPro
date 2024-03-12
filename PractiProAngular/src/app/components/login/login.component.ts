import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router) {
    sessionStorage.clear();
   }

  userdata: any;
  loginfail = false;  


  loginform = this.builder.group({
    email: this.builder.control('', Validators.required),
    password: this.builder.control('', Validators.required)
  })

  proceedlogin() {    
    this.service.Getbycode(this.loginform.value.email).subscribe(res => {
      this.userdata = res;
      console.log(this.userdata);
      if (this.userdata.password === this.loginform.value.password) {
        if (this.userdata.isActive) {
          sessionStorage.setItem('email',this.userdata.email);
          sessionStorage.setItem('userrole',this.userdata.email);
          this.router.navigate(['dashboard']);
          this.service.isLoggedIn=true;
        } else {
          console.error("Inactive user. Please contact admin.");
          this.loginfail = true;
        }
      } else {
        console.error("Invalid credentials!");
        this.loginfail = true;
      }
    })
  }

  closeFailToast() {
    this.loginfail = false;
  }


}
