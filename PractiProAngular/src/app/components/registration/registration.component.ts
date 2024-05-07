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
  

  registerform = this.builder.group({
    firstName: this.builder.control('', Validators.required),
    lastName: this.builder.control('', Validators.required),    
    email: this.builder.control('', Validators.compose([Validators.required, Validators.email])),
    password: this.builder.control('', Validators.required)
  });

  proceedregistration() {
    if (this.registerform.valid) {
      this.service.proceedRegister(this.registerform.value).subscribe(res => {
        console.log("Registered Successfully, please contact Admin for approval.")        
        this.router.navigate(['login']);
      });
    } else {
      alert("Please enter valid data");      
    }
  }

}
