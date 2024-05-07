import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-updatepopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatDialogActions, MatDialogClose],
  templateUrl: './updatepopup.component.html',
  styleUrl: './updatepopup.component.css'
})
export class UpdatepopupComponent implements OnInit {
  rolelist: any;
  registrationfail = false;
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<UpdatepopupComponent>) { }

  editdata: any;
  ngOnInit(): void {
    this.service.GetAllRoles().subscribe(res => {
      this.rolelist = res;
    })
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getUser(this.data.usercode).subscribe((res: any) => {
        this.editdata = res.payload[0]; // Access data from the payload property
        this.updateform.setValue({
          id: this.editdata.id,
          firstName: this.editdata.firstName,
          lastName: this.editdata.lastName,          
          email: this.editdata.email,
          password: this.editdata.password,
          role: this.editdata.role,
          isActive: this.editdata.isActive
        });

      })
    }
  }


  updateform = this.builder.group({
    id: this.builder.control(''),
    firstName: this.builder.control(''),
    lastName: this.builder.control(''),    
    email: this.builder.control(''),
    password: this.builder.control(''),
    role: this.builder.control('', Validators.required),
    isActive: this.builder.control(false)
  });

  updateUser() {
    if (this.updateform.valid) {
      this.service.Updateuser(this.updateform.value.id, this.updateform.value).subscribe(res => {
        console.log("Updated successfully.");
        this.dialog.close();
      })
    } else {
      console.log("Please Select Role.");
    }
  }


}

