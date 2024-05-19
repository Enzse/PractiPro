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
  selector: 'app-assigncoordpopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './assigncoordpopup.component.html',
  styleUrl: './assigncoordpopup.component.css'
})
export class AssigncoordpopupComponent {
  classlist: any;
  coordlist: any;

  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<AssigncoordpopupComponent>) {
    this.service.getClasses().subscribe(res => {
      this.classlist = res;
    });
    this.service.getCoordinator().subscribe(res => {
      this.coordlist = res;
    });
  }

  inputform = this.builder.group({
    coordinator_id: this.builder.control('', Validators.required),
    block_name: this.builder.control('', Validators.required)
  });

  submitForm() {
    if (this.inputform.valid) {
      this.service.assignClassCoordinator(this.inputform.value).subscribe(() => {
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
