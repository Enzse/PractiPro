import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import Swal from 'sweetalert2';
import { TermsofserviceComponent } from '../../../popups/popups-registration/termsofservice/termsofservice.component';
import { MatDialog } from '@angular/material/dialog';
import { passwordStrengthValidator } from '../../../../validators/password-strength.validator';
import { emailDomainValidator } from '../../../../validators/email-domain.validator';
import { AuthService } from '../../../../services/api/auth.service';
import { Registration } from '../../../../models/user';
import { Role } from '../../../../models/user';

@Component({
    selector: 'app-registrationadvisor',
    imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
    templateUrl: './registrationadvisor.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './registrationadvisor.component.css'
})
export class RegistrationadvisorComponent implements OnInit {
  private readonly authApi = inject(AuthService);
  constructor(
    private builder: NonNullableFormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.registerform.patchValue({
      role: 'advisor',
    });
  }

  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),
    email: this.builder.control(
      '',
      Validators.compose([
        Validators.required,
        Validators.email,
        emailDomainValidator('gordoncollege.edu.ph'),
      ])
    ),
    password: this.builder.control('', [
      Validators.required,
      passwordStrengthValidator,
    ]),
    terms: [false, Validators.requiredTrue],
    role: this.builder.control<Role>('advisor', Validators.required),
    department: this.builder.control('', Validators.required),
  });

  proceedregistration() {
    if (this.registerform.valid) {
      this.authApi.register(this.registerform.getRawValue()).subscribe(
        () => {
          this.router.navigate(['login']);
          Swal.fire({
            title: 'Email Confirmation Sent!',
            text: 'Please check your email for account activation. An administrator will also need to approve your account before you can log in.',
            icon: 'success',
            footer:
              '(This to prove the email is <b>valid </b>and is <b>yours</b>.)',
          });
        },
        (error) => {
          if (error.status === 400) {
            Swal.fire({
              title: 'Email already exists!',
              text: 'Please use a different email address.',
              icon: 'warning',
            });
          } else {
            Swal.fire({
              title: 'Unable to register now.',
              text: 'Please try again another time.',
              icon: 'warning',
            });
          }
        }
      );
    } else {
      Swal.fire({
        title: 'Please enter valid data.',
        text: 'Double check the forms to see if you have mistakenly inputted data.',
        icon: 'error',
      });
    }
  }

  termsOfService() {
    const popup = this.dialog.open(TermsofserviceComponent, {
      enterAnimationDuration: '350ms',
      exitAnimationDuration: '300ms',
      width: 'auto',
      height: '90%',
      data: {},
    });
  }
}
