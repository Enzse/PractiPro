import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  constructor(private builder: FormBuilder, private service: AuthService, private router: Router) {  }
  
  registrationfail = false;


  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),
    // studentId: this.builder.control('', Validators.compose([Validators.required, Validators.minLength(9)])),
    // phoneNumber: this.builder.control('', Validators.compose([Validators.required, Validators.minLength(11)])),
    // program: this.builder.control('', Validators.required),
    // block: this.builder.control('', Validators.required),
    // year: this.builder.control('', Validators.required),
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email])),
    password: this.builder.control('', Validators.required),
    role: this.builder.control(''),
    isActive: this.builder.control(false)
  });

  proceedregistration() {
    if (this.registerform.valid) {
      this.service.Proceedregister(this.registerform.value).subscribe(res => {
        console.log("Registered Successfully, please contact Admin for approval.")        
        this.router.navigate(['login']);
      });
    } else {
      console.error("Please enter valid data");
      this.registrationfail = true;
        setTimeout(() => this.registrationfail = false, 3000);
    }
  }
 
  closeFailToast() {
    this.registrationfail = false;
  }

}
