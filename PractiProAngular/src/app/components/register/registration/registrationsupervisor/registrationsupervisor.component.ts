import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { NoticetosupervisorsComponent } from '../../../popups/popups-registration/noticetosupervisors/noticetosupervisors.component';
import { TermsofserviceComponent } from '../../../popups/popups-registration/termsofservice/termsofservice.component';
import { passwordStrengthValidator } from '../../../../validators/password-strength.validator';

@Component({
  selector: 'app-registrationsupervisor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './registrationsupervisor.component.html',
  styleUrl: './registrationsupervisor.component.css'
})
export class RegistrationsupervisorComponent implements OnInit {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.registerform.patchValue({
      role: 'supervisor'
    });
  }

  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email])),
    password: this.builder.control('', [Validators.required, passwordStrengthValidator]),
    terms: [false, Validators.requiredTrue],
    role: this.builder.control('', [Validators.required]),
    company_name: this.builder.control('', [Validators.required]),
    position: this.builder.control('', [Validators.required]),
    phone: this.builder.control('', [Validators.required]),
    address: this.builder.control('', [Validators.required]),
  });

  proceedregistration() {
    if (this.registerform.valid) {
      this.service.proceedRegister(this.registerform.value).subscribe(() => {
        console.log('Registered successfully. Please wait for admin activation.');
        this.router.navigate(['login']);
        Swal.fire({
          title: "Registration Successful!",
          text: "Please wait for admin activation.",
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
