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
  selector: 'app-inspectprofilepopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatDialogActions, MatDialogClose],
  templateUrl: './inspectprofilepopup.component.html',
  styleUrl: './inspectprofilepopup.component.css'
})
export class InspectprofilepopupComponent {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<InspectprofilepopupComponent>) { }



  //This dynamically displays the data according to changes.
  editdata?: any;
  ngOnInit(): void {
    const userId = this.data.usercode;
    if (userId) {
      this.service.getStudent(userId).subscribe((res: any) => {
        console.log(userId);
        console.log("API response:", res);
        console.log(res);
        this.editdata = res[0];
        this.editForm.setValue({
          firstName: this.editdata.firstName,
          lastName: this.editdata.lastName,
          studentId: this.editdata.studentId,
          program: this.editdata.program,
          year: this.editdata.year,
          phoneNumber: this.editdata.phoneNumber,
          address: this.editdata.address,
          dateOfBirth: this.editdata.dateOfBirth
        });

      })
    }
  }

  //This serves as a placeholder for the student data.
  editForm = this.builder.group({
    firstName: this.builder.control(''),
    lastName: this.builder.control(''),
    studentId: this.builder.control(''),
    program: this.builder.control(''),
    year: this.builder.control(''),
    phoneNumber: this.builder.control(''),
    address: this.builder.control(''),
    dateOfBirth: this.builder.control(''),
  });

  //This is for the Submit button functionality.
  editInformation() {
    if (this.editForm.valid) {
      this.service.editStudentInfo(this.data.usercode, this.editForm.value).subscribe(res => {
        console.log(`Updated successfully: ${this.data.usercode}`);
        this.dialog.close();
      })
    } else {
      console.log("Error Inputting Data.");
    }
  }
}
