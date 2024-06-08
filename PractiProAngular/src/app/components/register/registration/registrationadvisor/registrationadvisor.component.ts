import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { TermsofserviceComponent } from '../../../popups/popups-registration/termsofservice/termsofservice.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-registrationadvisor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './registrationadvisor.component.html',
  styleUrl: './registrationadvisor.component.css'
})
export class RegistrationadvisorComponent implements OnInit {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router, private dialog: MatDialog) { }

  passwordStrength(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value;
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!regex.test(password)) {
      return { 'weakPassword': true };
    }
    return null;
  }


  ngOnInit(): void {
    this.registerform.patchValue({
      role: 'advisor'
    });
  }


  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email])),
    password: this.builder.control('', [Validators.required, this.passwordStrength]),
    role: this.builder.control('', Validators.required),
    department: this.builder.control('', Validators.required),
  });

  
  proceedregistration() {
    if (this.registerform.valid) {
      this.service.proceedRegister(this.registerform.value).subscribe(() => {
        console.log('Registered successfully. Please contact admin for activation.');
        this.router.navigate(['login']);
        Swal.fire({
          title: "Registration Successful!",
          text: "Please contact admin for activation.",
          icon: "success"
        });
      }, error => {
        if (error.status === 400) {
          Swal.fire({
            title: "Email already exists!",
            text: 'Please use a different email address.',
            icon: "warning"
          });
        } else {
          Swal.fire({
            title: "Unable to register now.",
            text: 'Please try again another time.',
            icon: "warning"
          });
        }
      });

    } else {
      Swal.fire({
        title: "Please enter valid data.",
        text: "Double check the forms to see if you have mistakenly inputted data.",
        icon: "error"
      });
    }
  }

  termsOfService() {
    const popup = this.dialog.open(TermsofserviceComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: 'auto',
      height: '90%',
      data: {
      }
    })
  }
}
