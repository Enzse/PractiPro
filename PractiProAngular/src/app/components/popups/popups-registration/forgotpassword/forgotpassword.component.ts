import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css'
})
export class ForgotpasswordComponent {
  emailForm = this.builder.group({
    email: ['', Validators.compose([Validators.email, Validators.required])]
  });

  constructor(private service: AuthService, private builder: FormBuilder, private dialogRef: MatDialogRef<ForgotpasswordComponent>) { }


  submitForm() {
    if (this.emailForm.valid) {
      this.service.resetPasswordToken(this.emailForm.value).subscribe((res: any) => {
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
