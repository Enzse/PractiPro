import { Component, Inject} from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import saveAs from 'file-saver';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';

@Component({
  selector: 'app-addseminarpopup',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './addseminarpopup.component.html',
  styleUrl: './addseminarpopup.component.css'
})
export class AddseminarpopupComponent {
  userId: any;
  seminarRecordForm: FormGroup;
  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogref: MatDialogRef<AddseminarpopupComponent>,
    private changeDetection: ChangeDetectionService) {

    this.userId = this.service.getCurrentUserId();

    this.seminarRecordForm = this.builder.group({
      event_name: this.builder.control('', Validators.required),
      event_date: this.builder.control('', Validators.required),
      event_type: this.builder.control('', Validators.required),
      duration: this.builder.control('', Validators.required),
    });
  }

  submitFiles() {
    if (this.seminarRecordForm.valid) {
      this.service.uploadSeminarRecord(this.data.id, this.seminarRecordForm.value).subscribe((res: any) => {
        this.changeDetection.notifyChange(true);
        Swal.fire({
          title: "Training Record Added!",
          icon: "success"
        });
        this.dialogref.close();
      })
    }
    else {
      Swal.fire({
        title: "Invalid data.",
        text: "Please enter valid data before submitting the record.",
        icon: "warning"
      });
    }
  }


}
