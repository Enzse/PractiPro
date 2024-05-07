
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
  selector: 'app-reviewsubmissions',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './reviewsubmissions.component.html',
  styleUrl: './reviewsubmissions.component.css'
})
export class ReviewsubmissionsComponent implements OnInit {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ReviewsubmissionsComponent>) { }

  studentSubmissions: any[] = [];

  ngOnInit(): void {
    console.log(this.data.usercode)
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getStudentSubmissions(this.data.usercode).subscribe(
        (data: any[]) => {
          this.studentSubmissions = data;
          console.log(this.studentSubmissions);
        },
        (error: any) => {
          console.error('Error fetching student submissions:', error);
        }
      );
    }
  }

  downloadSubmission(submissionId: number) {
    this.service.downloadSubmission(submissionId).subscribe(
      (data: Blob) => {
        saveAs(data, `submission_${submissionId}.pdf`);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }
}
