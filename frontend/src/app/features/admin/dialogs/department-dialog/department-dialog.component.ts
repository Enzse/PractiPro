import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../../../core/api/user.service';
import { ClassService } from '../../../../core/api/class.service';
import { ApiResponse } from '../../../../core/models/api';
import { Department } from '../../../../core/models/user';

@Component({
    selector: 'app-department-dialog',
    imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatDialogClose],
    templateUrl: './department-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './department-dialog.component.css'
})
export class DepartmentDialogComponent implements OnInit {
  private readonly userApi = inject(UserService);
  private readonly classApi = inject(ClassService);
  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<DepartmentDialogComponent>) { }

  deptlist: ApiResponse<Department[]> | undefined;  
  editdata: any;

  ngOnInit(): void {    
    this.userApi.departments().subscribe(res => {
      this.deptlist = res;
    });
    if (this.data.usercode != null && this.data.usercode != '') {
      this.classApi.coordinator(this.data.usercode).subscribe((res) => {
        console.log(this.data.usercode);
        console.log(res.payload);

        this.editdata = res.payload[0];
        console.log('coord:' + this.editdata.department); // Access data from the payload property
        this.departmentform.setValue({
          department: this.editdata.department,
        });
      })

      this.userApi.get(this.data.usercode).subscribe((res) => {
        this.editdata = res.payload[0]; // Access data from the payload property
        console.log('user:' + this.editdata);
      })
    }
  }

  departmentform = this.builder.group({
    department: this.builder.control('', Validators.required),
  });



  updateUser() {
    if (this.departmentform.valid) {
      this.userApi.updateCoordinatorDepartment(this.data.usercode, this.departmentform.getRawValue()).subscribe(res => {
        console.log("Updated successfully.");
        this.dialog.close();
      }, error => {
        alert("Unable to change user role. User might have dependent properties.")
      })
    } else {
      alert("Please Select Role.");
    }
  }

}
