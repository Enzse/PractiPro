
import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';

@Component({
  selector: 'app-reviewsubmissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviewsubmissions.component.html',
  styleUrl: './reviewsubmissions.component.css'
})
export class ReviewsubmissionsComponent implements OnInit {
  constructor(private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ReviewsubmissionsComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    console.log(`ID: ${this.data.usercode}`);
    this.service.getSubmissionsByStudent('submissions', this.data.usercode).subscribe(
      (res: any) => {
        this.studentSubmissions = res.payload;
        console.log(this.studentSubmissions);
      },
      (error: any) => {
        console.error('Error fetching student submissions:', error);
      }
    );
  }

  downloadRequirement(submissionId: number, submissionName: string) {
    this.service.downloadRequirement(submissionId).subscribe(
      (data: any) => {
        console.log(data);
        saveAs(data, submissionName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }

  viewFile(submissionId: number, submissionName: string) {
    this.service.downloadRequirement(submissionId).subscribe(
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
