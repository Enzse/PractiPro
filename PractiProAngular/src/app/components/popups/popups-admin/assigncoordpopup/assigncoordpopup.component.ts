import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { ClassService } from '../../../../services/api/class.service';

@Component({
    selector: 'app-assigncoordpopup',
    imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
    templateUrl: './assigncoordpopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './assigncoordpopup.component.css'
})
export class AssigncoordpopupComponent {
  private readonly classApi = inject(ClassService);
  classlist: any;
  coordlist: any;

  constructor(private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<AssigncoordpopupComponent>) {
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
      this.classApi.assignCoordinator(this.inputform.value as { coordinator_id: number | string; block_name: string }).subscribe(() => {
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
