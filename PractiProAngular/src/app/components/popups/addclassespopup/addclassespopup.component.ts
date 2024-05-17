import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-addclassespopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './addclassespopup.component.html',
  styleUrl: './addclassespopup.component.css'
})
export class AddclassespopupComponent {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<AddclassespopupComponent>) { }



  insertform = this.builder.group({
    block_name: this.builder.control('', Validators.required),
    department: this.builder.control('', Validators.required),
    course: this.builder.control('', Validators.required),
    year_level: this.builder.control('', Validators.required)
  });

  submitForm() {
    if (this.insertform.valid) {
      this.service.addClass(this.insertform.value).subscribe(() => {
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
