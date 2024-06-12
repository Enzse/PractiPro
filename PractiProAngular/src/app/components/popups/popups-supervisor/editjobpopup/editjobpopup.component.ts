import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';

@Component({
  selector: 'app-editjobpopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatDialogActions, MatDialogClose],
  templateUrl: './editjobpopup.component.html',
  styleUrl: './editjobpopup.component.css'
})
export class EditjobpopupComponent {
  existingdata?: any;
  changeDetected: any;

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
    student_id: this.builder.control(''),
    supervisor_id: this.builder.control(''),
    job_title: this.builder.control(''),
    start_date: this.builder.control(''),
    end_date: this.builder.control(''),
    job_description: this.builder.control(''),
  });

  editJob() {
    if (this.jobForm.valid) {
      const userId: any = this.service.getCurrentUserId();
      this.jobForm.patchValue({
        student_id: this.data.student.id,
        supervisor_id: userId,
      })
      console.log(this.jobForm.value)
      this.service.assignJobToStudent(this.jobForm.value).subscribe(res => {
        this.changeDetected = true;
        this.changeDetection.notifyChange(true);
        this.dialog.close(this.changeDetected)
      })
    } else {
      Swal.fire({
        title: "Invalid Input",
        text: "Double-check your information to see any areas you've not yet inputted",
        icon: "error"
      });
    }
  }

}
