import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-editinformationpopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatDialogActions, MatDialogClose],
  templateUrl: './editinformationpopup.component.html',
  styleUrl: './editinformationpopup.component.css'
})
export class EditinformationpopupComponent implements OnInit {

  //Constructor
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<EditinformationpopupComponent>) { }



  //This dynamically displays the data according to changes.
  editdata?: any;
  ngOnInit(): void {
    const userId = this.service.getCurrentUserId();
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
    studentId: this.builder.control('', [Validators.maxLength(9), Validators.minLength(9)]),
    program: this.builder.control(''),
    year: this.builder.control(''),
    phoneNumber: this.builder.control('', [Validators.maxLength(11)]),
    address: this.builder.control(''),
    dateOfBirth: this.builder.control(''),
  });

  //This is for the Submit button functionality.
  editInformation() {
    if (this.editForm.valid) {
      this.service.editStudentInfo(this.service.getCurrentUserId(), this.editForm.value).subscribe(res => {
        console.log("Updated successfully.");
        this.dialog.close();
      })
    } else {
      Swal.fire({
        title: "Invalid Input",
        text: "Double-check your information to see any forms you've mistakenly entered.",
        icon: "error"
      });
    }
  }


}
