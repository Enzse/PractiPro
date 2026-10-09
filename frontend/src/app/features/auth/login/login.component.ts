import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ChooseRoleDialogComponent } from '../dialogs/choose-role-dialog/choose-role-dialog.component';
import { ForgotPasswordDialogComponent } from '../dialogs/forgot-password-dialog/forgot-password-dialog.component';
import { SessionService } from '../../../core/auth/session.service';
import { AuthService } from '../../../core/api/auth.service';
import { Credentials } from '../../../core/models/user';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
    templateUrl: './login.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly session = inject(SessionService);
  private readonly authApi = inject(AuthService);
  returnUrl: any
  constructor(private route: ActivatedRoute, private builder: NonNullableFormBuilder, private router: Router, private dialog: MatDialog) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    this.session.clear();
  }



  //FormBuilder
  loginform = this.builder.group({
    email: this.builder.control('', Validators.required),
    password: this.builder.control('', Validators.required)
  })

  onLogin2() {

    this.authApi.login(this.loginform.getRawValue()).subscribe((res) => {
      if (res.token) {
        this.session.saveToken(res.token);

        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        }
        else {
          switch (this.session.role()) {
            case 'admin':
            case 'superadmin':
              this.router.navigate(['/admin/users']);
              break;
            case 'student':
              this.router.navigate(['/student/dashboard']);
              break;
            case 'advisor':
              this.router.navigate(['/coordinator/classes']);
              break;
            case 'supervisor':
              this.router.navigate(['/supervisor']);
              break;
            default:
              alert("User's role is unhandled.")
          }
        }
      } else {
        Swal.fire({
          title: "Error",
          text: "Invalid Credentials. Please try again.",
          icon: "error"
        });
      }
    }, error => {
      if (error.status == 401) {
        Swal.fire({
          title: "Error",
          text: "Invalid Credentials. Please try again.",
          icon: "error"
        });
      };
      if (error.status == 403) {
        // 403 means either "not activated yet" or "waiting for admin approval"; the API says which.
        const awaitingApproval = error.error?.status?.message?.includes('approval');
        Swal.fire({
          title: awaitingApproval ? "Awaiting Approval" : "Inactive User!",
          text: awaitingApproval
            ? "An administrator needs to approve your account before you can log in."
            : "Please check the inbox of your email for account activation.",
          icon: "warning"
        });
      };
      if (error.status == 404) {
        Swal.fire({
          title: "User does not exist!",
          text: "Please double check your entered email.",
          icon: "error"
        });
      };
    });
  }

  registerUser() {
    const popup = this.dialog.open(ChooseRoleDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: 'auto',
      data: {
      }
    })
  }

  forgotPassword() {
    const popup = this.dialog.open(ForgotPasswordDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: 'auto',
      data: {
      }
    })
  }


}







