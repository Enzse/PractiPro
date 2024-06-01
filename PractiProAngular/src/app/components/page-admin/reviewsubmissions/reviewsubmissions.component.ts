
import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { saveAs } from 'file-saver';
import { PdfviewerComponent } from '../../popups/shared/pdfviewer/pdfviewer.component';

@Component({
  selector: 'app-reviewsubmissions',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './reviewsubmissions.component.html',
  styleUrl: './reviewsubmissions.component.css'
})
export class ReviewsubmissionsComponent implements OnInit {
  constructor(private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ReviewsubmissionsComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];

  ngOnInit(): void {
    console.log(this.data.usercode)
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getRequirementSubmissionsByUser(this.data.usercode).subscribe(
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
