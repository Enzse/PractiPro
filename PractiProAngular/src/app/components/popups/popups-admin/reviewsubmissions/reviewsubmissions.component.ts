
import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';
import { SubmissionService } from '../../../../services/api/submission.service';

@Component({
    selector: 'app-reviewsubmissions',
    imports: [],
    templateUrl: './reviewsubmissions.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './reviewsubmissions.component.css'
})
export class ReviewsubmissionsComponent implements OnInit {
  private readonly submissionApi = inject(SubmissionService);
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ReviewsubmissionsComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    console.log(`ID: ${this.data.usercode}`);
    this.submissionApi.list('submissions', this.data.usercode).subscribe(
      (res: any) => {
        this.studentSubmissions = res.payload;
        console.log(this.studentSubmissions);
      },
      (error: any) => {
        console.error('Error fetching student submissions:', error);
      }
    );
  }

  downloadFile(submissionId: number, submissionName: string) {
    this.submissionApi.download('submissions', submissionId).subscribe(
      (data: any) => {
        console.log(data);
        saveAs(data, submissionName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }

  viewFile(submissionId: number) {
    this.submissionApi.download('submissions', submissionId).subscribe(
      (data: any) => {
        const popup = this.dialog2.open(PdfviewerComponent, {
          enterAnimationDuration: "0ms",
          exitAnimationDuration: "500ms",
          width: "90%",
          data: {
            selectedPDF: data
          }
        })
      },
      (error: any) => {
        console.error('Error viewing submission:', error);
      }
    );

  }

  viewSubmissions(code: any) {
    const popup = this.dialog2.open(ReviewsubmissionsComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "95%",
      data: {
        usercode: code
      }
    })
  }

}
