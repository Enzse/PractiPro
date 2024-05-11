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
  selector: 'app-deptpopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatDialogActions, MatDialogClose],
  templateUrl: './deptpopup.component.html',
  styleUrl: './deptpopup.component.css'
})
export class DeptpopupComponent implements OnInit {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<DeptpopupComponent>) { }

  deptlist: any;
  rolelist: any;
  editdata: any;

  ngOnInit(): void {
    this.service.GetAllRoles().subscribe(res => {
      this.rolelist = res;
    });
    this.service.getAllDepartments().subscribe(res => {
      this.deptlist = res;
    });
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getCoordinator(this.data.usercode).subscribe((res: any) => {
        console.log(res);

        this.editdata = res[0];
        console.log('coord:' + this.editdata.department); // Access data from the payload property
        this.departmentform.setValue({
          id: this.editdata.id,
          department: this.editdata.department,
        });
      })

      this.service.getUser(this.data.usercode).subscribe((res: any) => {
        this.editdata = res.payload[0]; // Access data from the payload property
        console.log('user:' + this.editdata);
        this.updateform.setValue({
          id: this.editdata.id,
          role: this.editdata.role,
        });
      })
    }
  }

  departmentform = this.builder.group({
    id: this.builder.control(''),
    department: this.builder.control('', Validators.required),
  });

  updateform = this.builder.group({
    id: this.builder.control(''),
    role: this.builder.control('', Validators.required),

  });

  updateUser() {
    if (this.departmentform.valid) {
      this.service.UpdateCoordinator(this.departmentform.value.id, this.departmentform.value).subscribe(res => {
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
