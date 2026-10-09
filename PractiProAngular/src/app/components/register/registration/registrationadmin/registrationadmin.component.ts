import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { TermsofserviceComponent } from '../../../popups/popups-registration/termsofservice/termsofservice.component';
import { passwordStrengthValidator } from '../../../../validators/password-strength.validator';
import { AuthService } from '../../../../services/api/auth.service';
import { Registration } from '../../../../models/user';

@Component({
    selector: 'app-registrationadmin',
    imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
    templateUrl: './registrationadmin.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './registrationadmin.component.css'
})
export class RegistrationadminComponent implements OnInit {
  private readonly authApi = inject(AuthService);
  constructor(
    private builder: FormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.registerform.patchValue({
      role: 'admin',
    });
  }

  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),
    email: this.builder.control(
      '',
      Validators.compose([Validators.required, Validators.email])
    ),
    password: this.builder.control('', [
      Validators.required,
      passwordStrengthValidator,
    ]),
    terms: this.builder.control('', Validators.requiredTrue),
    role: this.builder.control('', Validators.required),
  });

  proceedregistration() {
    if (this.registerform.valid) {
      this.authApi.register(this.registerform.value as Registration).subscribe(
        () => {
          this.router.navigate(['login']);
          Swal.fire({
            title: 'Registration Successful!',
            text: 'Please wait for super-admin activation.',
            icon: 'success',
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
