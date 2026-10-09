import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UserService } from '../../../../services/api/user.service';
import { RoleOption, User } from '../../../../models/user';

@Component({
    selector: 'app-updatepopup',
    imports: [ReactiveFormsModule, MatDialogClose],
    templateUrl: './updatepopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './updatepopup.component.css'
})
export class UpdatepopupComponent implements OnInit {
  private readonly userApi = inject(UserService);
  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<UpdatepopupComponent>) { }

  rolelist: RoleOption[] | undefined;
  editdata: User | undefined;
  userrole: any;


  ngOnInit(): void {
    this.userrole = this.data.userrole;
    console.log(this.userrole)
    this.userApi.roles().subscribe((res) => {
      if(this.userrole !== 'superadmin'){
        this.rolelist = res.payload.filter((role) => !role.code.includes('admin'));
      }else{
        this.rolelist = res.payload;
      }
    });


    if (this.data.usercode != null && this.data.usercode != '') {
      this.userApi.get(this.data.usercode).subscribe((res) => {
        this.editdata = res.payload[0]; // Access data from the payload property
        this.updateform.setValue({
          id: String(this.editdata.id),
          firstName: this.editdata.firstName,
          lastName: this.editdata.lastName,
          email: this.editdata.email,
          role: this.editdata.role,
          isActive: this.editdata.isActive === 1
        });

      })

    }
    else {
      alert("No user selected.");
    }
  }


  updateform = this.builder.group({
    id: this.builder.control(''),
    firstName: this.builder.control(''),
    lastName: this.builder.control(''),
    email: this.builder.control(''),
    role: this.builder.control('', Validators.required),
    isActive: this.builder.control(false)
  });

  updateUser() {
    if (this.updateform.valid) {
      this.userApi.update(Number(this.updateform.value.id), this.updateform.getRawValue()).subscribe(res => {
        console.log("Updated successfully.");
        this.dialog.close();
      }, error => {
        alert("Unable to change user role. User might have dependent properties.")
      })
    } else {
      alert("Please Select Role.");
    }
  }

  deleteUser() {
    Swal.fire({
      title: "Are you sure?",
      text: "Deleting a user is not reversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#20284a",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialog.close();
        const userId = this.data.usercode;
        console.log('Deleting user with ID:', userId);
        this.userApi.delete(userId).subscribe(
          res => {
            Swal.fire({
              title: "Deleted!",
              text: "The user has been deleted.",
              icon: "success"
            });
          }, error => {
              Swal.fire({
                title: "Delete failed",
                text: "You may not have permission to delete this user.",
                icon: "error"
              });
          });
      }
    });
  }

  // this.userApi.update(Number(this.updateform.value.id), this.updateform.getRawValue()).subscribe(res => {
  //   console.log("Updated successfully.");
  //   this.dialog.close();
  // }, error => {
  //   alert("Unable to change user role. User might have dependent properties.")
  // })

}



