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
import { NewClass } from '../../../../core/models/class';


@Component({
    selector: 'app-add-class-dialog',
    imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
    templateUrl: './add-class-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './add-class-dialog.component.css'
})
export class AddClassDialogComponent {
  private readonly classApi = inject(ClassService);
  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<AddClassDialogComponent>) { }



  insertform = this.builder.group({
    block_name: this.builder.control('', Validators.required),
    course: this.builder.control('', Validators.required),
    year_level: this.builder.control('', Validators.required)
  });

  submitForm() {
    if (this.insertform.valid) {
      this.classApi.create(this.insertform.getRawValue()).subscribe(() => {
        this.dialog.close();
        Swal.fire({
          title: "Success!",
          text: `The class ${this.insertform.value.block_name} has been successfully added to the database.`,
          icon: "success"
        });
      });

    } else {
      alert('Please enter valid data');
    }
  }
}
