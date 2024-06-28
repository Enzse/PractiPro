import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { passwordStrengthValidator } from '../../../validators/password-strength.validator';
import { passwordMatchValidator } from '../../../validators/password-match.validator';
@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive, MatTooltipModule],
  templateUrl: './reset-password-form.component.html',
  styleUrl: './reset-password-form.component.css'
})
export class ResetPasswordFormComponent implements OnInit {
  passwordForm = this.builder.group({
    password: this.builder.control('', [Validators.required, passwordStrengthValidator]),
    repeatPassword: this.builder.control('', [Validators.required, passwordMatchValidator]),
    token: this.builder.control('')
  }, { validators: passwordMatchValidator });
  token: string;
  status: any;

  constructor(private builder: FormBuilder, private service: AuthService, private router: Router, private route: ActivatedRoute) {
    this.token = this.route.snapshot.queryParams['token'];    
    // alert(this.token);
    // Swal.fire({
    //   title: `${this.token}`
    // });
  }

  ngOnInit(): void {
    this.service.getResetPasswordToken(this.token).subscribe((res: any) => {
      this.status = 'valid';
      this.passwordForm.patchValue({
        token: this.token
      })
    }, error => {
      if (error.status === 401) {
        this.status = 'expired';
        alert("This request for password reset has expired. Please issue another request. You are now being redirected to the login page.");
        this.router.navigate(['/login']);
      }
      if (error.status === 404) {
        this.status = 'invalid';
        alert("No such token is found. You are now being redirected to the login page.");
        this.router.navigate(['/login']);
      }
    });
  }

  proceedReset() {
    if (this.passwordForm.valid) {
      this.service.resetPassword(this.passwordForm.value).subscribe(() => {
        this.router.navigate(['login']);
        Swal.fire({
          title: "Password Reset Successful!",
          text: "Be sure to remember your new password.",
          icon: "success"
        });
      });
    } else {
      Swal.fire({
        title: "Please enter valid data.",
        text: "Double check the forms to see if you have mistakenly inputted data.",
        icon: "error"
      });
    }
  }


}
