import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { ClassService } from '../../../../core/api/class.service';
import { ClassBlock, Coordinator } from '../../../../core/models/class';
import { ApiResponse } from '../../../../core/models/api';

@Component({
    selector: 'app-assign-coordinator-dialog',
    imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
    templateUrl: './assign-coordinator-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './assign-coordinator-dialog.component.css'
})
export class AssignCoordinatorDialogComponent {
  private readonly classApi = inject(ClassService);
  classlist: ClassBlock[] | undefined;
  coordlist: ApiResponse<Coordinator[]> | undefined;

  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<AssignCoordinatorDialogComponent>) {
    this.classApi.all().subscribe(res => {
      this.classlist = res.payload;
    });
    this.classApi.coordinators().subscribe(res => {
      this.coordlist = res;
    });
  }

  inputform = this.builder.group({
    coordinator_id: this.builder.control('', Validators.required),
    block_name: this.builder.control('', Validators.required)
  });

  submitForm() {
    if (this.inputform.valid) {
      this.classApi.assignCoordinator(this.inputform.getRawValue()).subscribe(() => {
        this.dialog.close();
        Swal.fire({
          title: "Request Successful!",
          icon: "success"
        })
      }, error => {
        if (error.status == 400) {
          Swal.fire({
            title: "Uh-oh!",
            text: "This coordinator is already assigned to this class!",
            icon: "error"
          })
        }
      });
    } else {
      Swal.fire({
        title: "Uh-oh!",
        text: "It seems you've entered invalid data.",
        icon: "error"
      });
    }
  }
}
