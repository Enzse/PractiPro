import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import Swal from 'sweetalert2';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { dateRangeValidator } from '../../../../validators/date-range.validator';
import { SessionService } from '../../../../services/session.service';
import { CompanyService } from '../../../../services/api/company.service';
import { JobAssignment } from '../../../../models/company';

@Component({
    selector: 'app-editjobpopup',
    imports: [ReactiveFormsModule],
    templateUrl: './editjobpopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './editjobpopup.component.css'
})
export class EditjobpopupComponent {
  private readonly session = inject(SessionService);
  private readonly companyApi = inject(CompanyService);
  existingdata?: any;
  changeDetected: any;
  userId: any = this.session.userId();

  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<EditjobpopupComponent>, private changeDetection: ChangeDetectionService) {
    this.changeDetected = [false];
  }


  ngOnInit(): void {
    this.companyApi.jobOf(this.data.student.id).subscribe((res: any) => {
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
