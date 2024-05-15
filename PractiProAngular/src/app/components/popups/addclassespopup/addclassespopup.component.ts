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
import { saveAs } from 'file-saver';

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
    year_level: this.builder.control('', Validators.required),
    coordinator_id: this.builder.control('', Validators.required)
  });

  submitForm() {
    if (this.insertform.valid) {

      this.service.addClass(this.insertform.value).subscribe(() => {
        alert('Registration successful! Please contact the admin for activation.');
      });

    } else {
      alert('Please enter valid data');
    }
  }
}
