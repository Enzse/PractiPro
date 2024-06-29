import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { TermsofserviceComponent } from '../../popups/popups-registration/termsofservice/termsofservice.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { emailDomainValidator } from '../../../validators/email-domain.validator';
import { passwordStrengthValidator } from '../../../validators/password-strength.validator';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive, MatTooltipModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router, private dialog: MatDialog) { }
  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email, emailDomainValidator('gordoncollege.edu.ph')])),
    password: this.builder.control('', [Validators.required, passwordStrengthValidator]),
    terms: [false, Validators.requiredTrue],
    role: this.builder.control('', [Validators.required]),
    studentId: this.builder.control('', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]),
    program: this.builder.control('', [Validators.required]),
    year: this.builder.control('', [Validators.required]),
  });

  ngOnInit(): void {
    this.registerform.patchValue({
      role: 'student'
    });
  }

  proceedregistration() {
    if (this.registerform.valid) {
      this.service.proceedRegister(this.registerform.value).subscribe(() => {
        this.router.navigate(['login']);
        Swal.fire({
          title: "Email Confirmation Sent!",
          text: "Please check your email for account activation.",
          icon: "success",
          footer: "(This to prove the email is <b>valid </b>and is <b>yours</b>.)"
        });
      }, error => {
        if (error.status === 400) {
          Swal.fire({
            title: "Email already exists!",
            text: 'Please use a different email address.',
            icon: "warning"
          });
        } else if (error.status === 409) {
          Swal.fire({
            title: "Student already exists!",
            text: 'Please use a different Student ID.',
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
