import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { TermsofserviceComponent } from '../../popups/popups-registration/termsofservice/termsofservice.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { emailDomainValidator } from '../../../validators/email-domain.validator';
import { passwordStrengthValidator } from '../../../validators/password-strength.validator';
@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, RouterLinkActive, MatTooltipModule],
  templateUrl: './reset-password-form.component.html',
  styleUrl: './reset-password-form.component.css'
})
export class ResetPasswordFormComponent implements OnInit {
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
  token:string;
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router, private route:ActivatedRoute) {
    this.token = this.route.snapshot.queryParams['token'];
    console.log(this.token);
   }

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


}
