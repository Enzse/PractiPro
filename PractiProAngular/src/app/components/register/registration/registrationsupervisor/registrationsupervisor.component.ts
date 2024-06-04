import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { NoticetosupervisorsComponent } from '../../../popups/popups-registration/noticetosupervisors/noticetosupervisors.component';
import { TermsofserviceComponent } from '../../../popups/popups-registration/termsofservice/termsofservice.component';

@Component({
  selector: 'app-registrationsupervisor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './registrationsupervisor.component.html',
  styleUrl: './registrationsupervisor.component.css'
})
export class RegistrationsupervisorComponent implements OnInit {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router, private dialog: MatDialog) { }

  passwordStrength(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value;
    // Password must contain at least one uppercase letter, one lowercase letter, and one digit
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!regex.test(password)) {
      return { 'weakPassword': true }; // Return specific error for weak password
    }
    return null;
  }

  ngOnInit(): void {
    this.registerform.patchValue({
      role: 'supervisor'
    });
  }

  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email])),
    password: this.builder.control('', [Validators.required, this.passwordStrength]),
    role: this.builder.control('', [Validators.required]),

    company_name: this.builder.control('', [Validators.required]),
    position: this.builder.control('', [Validators.required]),
    phone: this.builder.control('', [Validators.required]),
    address: this.builder.control('', [Validators.required]),
  });

  proceedregistration() {
    if (this.registerform.valid) {
      const email = this.registerform.value;
      console.log(email);
      // Check if the email already exists in the database
      this.service.doesEmailExist(email).subscribe((res: any) => {
        if (res) {
          Swal.fire({
            title: "Email already exists!",
            text: 'Please use a different email address.',
            icon: "warning"
          });
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
        text: "Double check the forms to see if you have mistakenly inputted data.",
        icon: "error"
      });
    }
  }


  noticeToSupervisors() {
    const popup = this.dialog.open(NoticetosupervisorsComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: 'auto',
      data: {
      }
    })
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
