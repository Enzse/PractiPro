import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UserService } from '../../../../services/api/user.service';

@Component({
    selector: 'app-updatepopup',
    imports: [ReactiveFormsModule, MatDialogActions, MatDialogClose],
    templateUrl: './updatepopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './updatepopup.component.css'
})
export class UpdatepopupComponent implements OnInit {
  private readonly userApi = inject(UserService);
  constructor(private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<UpdatepopupComponent>) { }

  rolelist: any;
  editdata: any;
  userrole: any;


  ngOnInit(): void {
    this.userrole = this.data.userrole;
    console.log(this.userrole)
    this.userApi.roles().subscribe((res: any) => {
      if(this.userrole !== 'superadmin'){
        this.rolelist = res.payload.filter((role: any) => !role.code.includes('admin'));
      }else{
        this.rolelist = res.payload;
      }
    });


    if (this.data.usercode != null && this.data.usercode != '') {
      this.userApi.get(this.data.usercode).subscribe((res: any) => {
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
    else {
      alert("No user selected.");
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
      this.userApi.update(Number(this.updateform.value.id), this.updateform.value as { role: string; isActive: boolean }).subscribe(res => {
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

  // this.userApi.update(Number(this.updateform.value.id), this.updateform.value as { role: string; isActive: boolean }).subscribe(res => {
  //   console.log("Updated successfully.");
  //   this.dialog.close();
  // }, error => {
  //   alert("Unable to change user role. User might have dependent properties.")
  // })

}



