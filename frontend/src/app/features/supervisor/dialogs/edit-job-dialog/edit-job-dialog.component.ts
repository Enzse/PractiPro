import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import Swal from 'sweetalert2';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { dateRangeValidator } from '../../../../shared/validators/date-range.validator';
import { SessionService } from '../../../../core/auth/session.service';
import { CompanyService } from '../../../../core/api/company.service';
import { JobAssignment } from '../../../../core/models/company';
import { Job } from '../../../../core/models/company';

@Component({
    selector: 'app-edit-job-dialog',
    imports: [ReactiveFormsModule],
    templateUrl: './edit-job-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './edit-job-dialog.component.css'
})
export class EditJobDialogComponent {
  private readonly session = inject(SessionService);
  private readonly companyApi = inject(CompanyService);
  existingdata?: Job | undefined;
  changeDetected: any;
  userId: any = this.session.requireUserId();

  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<EditJobDialogComponent>, private changeDetection: DataRefreshService) {
    this.changeDetected = [false];
  }


  ngOnInit(): void {
    this.companyApi.jobOf(this.data.student.id).subscribe((res) => {
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
    job_title: this.builder.control('', Validators.required),
    start_date: this.builder.control('', Validators.required),
    end_date: this.builder.control('', Validators.required),
    job_description: this.builder.control('', Validators.required),
  }, { validators: dateRangeValidator() });



  editJob() {
    if (this.jobForm.valid) {
      console.log(this.jobForm.value)
      this.companyApi.assignJob({
        ...this.jobForm.getRawValue(),
        student_id: this.data.student.id,
        supervisor_id: this.session.requireUserId(),
      }).subscribe(res => {
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
