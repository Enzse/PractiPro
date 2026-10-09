import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { SessionService } from '../../../../core/auth/session.service';
import { StudentService } from '../../../../core/api/student.service';
import { StudentProfileUpdate } from '../../../../core/models/student';
import { Student } from '../../../../core/models/student';


@Component({
    selector: 'app-edit-profile-dialog',
    imports: [ReactiveFormsModule],
    templateUrl: './edit-profile-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './edit-profile-dialog.component.css'
})
export class EditProfileDialogComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);

  //Constructor
  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<EditProfileDialogComponent>) { }



  //This dynamically displays the data according to changes.
  editdata?: Student | undefined;
  ngOnInit(): void {
    const userId = this.session.requireUserId();
    if (userId) {
      this.studentApi.get(userId).subscribe((res) => {
        this.editdata = res.payload[0];
        this.editForm.setValue({
          firstName: this.editdata.firstName,
          lastName: this.editdata.lastName,
          studentId: String(this.editdata.studentId ?? ''),
          program: this.editdata.program ?? '',
          year: String(this.editdata.year ?? ''),
          phoneNumber: this.editdata.phoneNumber ?? '',
          address: this.editdata.address ?? '',
          dateOfBirth: this.editdata.dateOfBirth ?? ''
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
    dateOfBirth: this.builder.control('')
  });

  //This is for the Submit button functionality.
  editInformation() {
    if (this.editForm.valid) {
      this.studentApi.update(this.session.requireUserId(), this.editForm.getRawValue()).subscribe(res => {
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

  closePopup() {
    this.dialog.close();
  }
}
