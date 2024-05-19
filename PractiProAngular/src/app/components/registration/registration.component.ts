import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router) {  }
  

  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),    
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email])),
    password: this.builder.control('', Validators.required)
  });

  proceedregistration() {
    if (this.registerform.valid) {
      const email = this.registerform.value;
      console.log(email);
      // Check if the email already exists in the database
      this.service.doesEmailExist(email).subscribe((res: any) => {
        if (res) {
          alert('Email already exists. Please use a different email address.');
        } else {
          // Proceed with registration if email is not already registered
          this.service.proceedRegister(this.registerform.value).subscribe(() => {
            console.log('Registered successfully. Please contact admin for activation.');
            this.router.navigate(['login']);
            Swal.fire({
              title: "Registration Successful!",
              text: "Please contact admin for activation.",
              icon: "success"
            });
          });
        }
      });
    } else {
      Swal.fire({
        title: "Please enter valid data.",
        icon: "error"
      });
    }
  }

}
