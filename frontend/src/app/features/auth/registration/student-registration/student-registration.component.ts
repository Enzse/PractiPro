import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import Swal from 'sweetalert2';
import { TermsOfServiceDialogComponent } from '../../dialogs/terms-of-service-dialog/terms-of-service-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { emailDomainValidator } from '../../../../shared/validators/email-domain.validator';
import { passwordStrengthValidator } from '../../../../shared/validators/password-strength.validator';
import { AuthService } from '../../../../core/api/auth.service';
import { Registration } from '../../../../core/models/user';
import { Role } from '../../../../core/models/user';

@Component({
    selector: 'app-student-registration',
    imports: [ReactiveFormsModule, RouterLink, RouterLinkActive, MatTooltipModule],
    templateUrl: './student-registration.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './student-registration.component.css'
})
export class StudentRegistrationComponent implements OnInit {
  private readonly authApi = inject(AuthService);
  constructor(private builder: NonNullableFormBuilder, private router: Router, private dialog: MatDialog) { }
  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email, emailDomainValidator('gordoncollege.edu.ph')])),
    password: this.builder.control('', [Validators.required, passwordStrengthValidator]),
    terms: [false, Validators.requiredTrue],
    role: this.builder.control<Role>('student', Validators.required),
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
      this.authApi.register(this.registerform.getRawValue()).subscribe(() => {
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
    const popup = this.dialog.open(TermsOfServiceDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: 'auto',
      height: '90%',
      data: {
      }
    })
  }

}
