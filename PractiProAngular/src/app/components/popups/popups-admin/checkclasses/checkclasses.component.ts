
import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { ClassService } from '../../../../services/api/class.service';

@Component({
    selector: 'app-checkclasses',
    imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, FormsModule],
    templateUrl: './checkclasses.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './checkclasses.component.css'
})
export class CheckclassesComponent {
  private readonly classApi = inject(ClassService);
  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<CheckclassesComponent>) { }

  datalist: any;
  currentuser: any;

  ngOnInit(): void {
    if (this.data.usercode != null && this.data.usercode != '') {
      this.classApi.coordinator(this.data.usercode).subscribe(res => {
        console.log(res);
        this.currentuser = res.payload[0]
        console.log(this.currentuser);
      });
      this.loadData();
    }
  }

  loadData() {
    this.classApi.ofCoordinator(this.data.usercode).subscribe((res) => {
        this.datalist = res?.payload;
        console.log(this.datalist);
      },
      (error: any) => {
        if (error.status == 404) {
          console.log('No classes found.')
        } else {
          console.error('Error fetching classes:', error);
        }

      }
    );
  }

  unassignCoordinator(block: any) {
    Swal.fire({
      title: "Are you sure?",
      text: `You are unassigning ${this.currentuser?.first_name} from ${block}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#20284a",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialog.close();
        this.classApi.unassignCoordinator(this.data.usercode, block).subscribe(() => {
          

        });
      }
    });
  }



}
