import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/api/auth.service';

@Component({
    selector: 'app-forgotpassword',
    imports: [ReactiveFormsModule],
    templateUrl: './forgotpassword.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './forgotpassword.component.css'
})
export class ForgotpasswordComponent {
  private readonly authApi = inject(AuthService);
  emailForm = this.builder.group({
    email: ['', [Validators.email, Validators.required]]
  });

  constructor(private builder: NonNullableFormBuilder, private dialogRef: MatDialogRef<ForgotpasswordComponent>) { }


  submitForm() {
    if (this.emailForm.valid) {
      this.authApi.requestPasswordReset(this.emailForm.getRawValue()).subscribe((res) => {
        Swal.fire({
          title: "Request Sent!",
          icon: "success"
        })
        this.dialogRef.close();
      }, error => {
        Swal.fire({
          title: "Email doesn't exist.",
          text: "No existing emails match the email you entered.",
        });
      })
    } else {
      Swal.fire({
        title: "Please enter a valid email.",
        icon: "warning"
      })
    }
  }



  close() {
    this.dialogRef.close();
  }
}
