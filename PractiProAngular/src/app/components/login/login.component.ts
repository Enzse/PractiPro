import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router) {
    sessionStorage.clear();
  }
  //testing purposes
  users:any;
  ngOnInit(): void {
    this.service.getAllUsers().subscribe(res => {
      this.users = res;
      console.log(this.users);
    });
   }
   //testing purposes
   
  userdata: any;
  loginfail = false;  
  inactive = false;  


  loginform = this.builder.group({
    id: this.builder.control('', Validators.required),
    password: this.builder.control('', Validators.required)
  })

  proceedlogin() {    
  this.service.Getbycode(this.loginform.value.id).subscribe(res => {
    this.userdata = res;
    console.log(this.userdata);
    // Check if payload array is not empty
    if (this.userdata.payload.length > 0) {
      const user = this.userdata.payload[0]; // Get the first user in the payload array
      if (user.password === this.loginform.value.password) {
        if (user.isActive) {
          sessionStorage.setItem('id', user.id);
          sessionStorage.setItem('userrole', user.role);
          if (this.service.GetUserRole() === 'admin'){
            this.router.navigate(['users']);
          } else if (this.service.GetUserRole() === 'student'){
            this.router.navigate(['dashboard']);
          }          
          this.service.isLoggedIn=true;
        } else {
          console.error("Inactive user. Please contact admin.");
          this.inactive = true;
        }
      } else {
        console.error("Invalid credentials!");
        this.loginfail = true;
      }
    } else {
      console.error("User not found!");
      this.loginfail = true;
    }
  });
}
  closeFailToast() {
    this.loginfail = false;
  }


}
