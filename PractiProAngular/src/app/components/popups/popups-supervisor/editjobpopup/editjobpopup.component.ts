import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';

import Swal from 'sweetalert2';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { dateRangeValidator } from '../../../../validators/date-range.validator';

@Component({
    selector: 'app-editjobpopup',
    imports: [ReactiveFormsModule, MatDialogActions, MatDialogClose],
    templateUrl: './editjobpopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './editjobpopup.component.css'
})
export class EditjobpopupComponent {
  existingdata?: any;
  changeDetected: any;
  userId: any = this.service.getCurrentUserId();

  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<EditjobpopupComponent>, private changeDetection: ChangeDetectionService) {
    this.changeDetected = [false];
  }


  ngOnInit(): void {
    this.service.getStudentJob(this.data.student.id).subscribe((res: any) => {
      this.existingdata = res.payload[0];
      if (this.existingdata) {
        this.jobForm.patchValue({
          job_title: this.existingdata.job_title,
          start_date: this.existingdata.start_date,
          end_date: this.existingdata.end_date,
          job_description: this.existingdata.job_description,
        });
      }

    })
  }

  jobForm = this.builder.group({
    student_id: this.data.student.id,
    supervisor_id: this.userId,
    job_title: this.builder.control('', Validators.required),
    start_date: this.builder.control('', Validators.required),
    end_date: this.builder.control('', Validators.required),
    job_description: this.builder.control('', Validators.required),
  }, { validators: dateRangeValidator() });



  editJob() {
    if (this.jobForm.valid) {
      console.log(this.jobForm.value)
      this.service.assignJobToStudent(this.jobForm.value).subscribe(res => {
        this.changeDetected = true;
        this.changeDetection.notifyChange(true);
        this.dialog.close(this.changeDetected)
      })
    } else {
      Swal.fire({
        title: "Invalid Job!",
        text: "Please enter valid job credentials.",
        icon: "warning"
      });
    }
  }

}
