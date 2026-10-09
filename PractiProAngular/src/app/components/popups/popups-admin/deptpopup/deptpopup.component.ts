import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../../../services/api/user.service';
import { ClassService } from '../../../../services/api/class.service';

@Component({
    selector: 'app-deptpopup',
    imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatDialogActions, MatDialogClose],
    templateUrl: './deptpopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './deptpopup.component.css'
})
export class DeptpopupComponent implements OnInit {
  private readonly userApi = inject(UserService);
  private readonly classApi = inject(ClassService);
  constructor(private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<DeptpopupComponent>) { }

  deptlist: any;  
  editdata: any;

  ngOnInit(): void {    
    this.userApi.departments().subscribe(res => {
      this.deptlist = res;
    });
    if (this.data.usercode != null && this.data.usercode != '') {
      this.classApi.coordinator(this.data.usercode).subscribe((res: any) => {
        console.log(this.data.usercode);
        console.log(res.payload);

        this.editdata = res.payload[0];
        console.log('coord:' + this.editdata.department); // Access data from the payload property
        this.departmentform.setValue({
          department: this.editdata.department,
        });
      })

      this.userApi.get(this.data.usercode).subscribe((res: any) => {
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
      this.userApi.updateCoordinatorDepartment(this.data.usercode, this.departmentform.value as { department: string }).subscribe(res => {
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
