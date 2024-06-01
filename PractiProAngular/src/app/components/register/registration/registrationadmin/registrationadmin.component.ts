import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrationadmin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './registrationadmin.component.html',
  styleUrl: './registrationadmin.component.css'
})
export class RegistrationadminComponent {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router) { }

  passwordStrength(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!regex.test(password)) {
      return { 'weakPassword': true }; 
    }
    return null;
  }

  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email])),
    password: this.builder.control('', [Validators.required, this.passwordStrength])
  });

  proceedregistration() {
    if (this.registerform.valid) {
      const email = this.registerform.value;
      console.log(email);
      this.service.doesEmailExist(email).subscribe((res: any) => {
        if (res) {
          alert('Email already exists. Please use a different email address.');
        } else {
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
        text: "Either you missed a form, or your password does not include 1 uppercase and lowercase letter, and 1 number.",
        icon: "error"
      });
    }
  }
}
