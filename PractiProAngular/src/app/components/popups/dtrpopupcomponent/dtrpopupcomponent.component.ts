
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { saveAs } from 'file-saver';
import { PdfviewerComponent } from '../pdfviewer/pdfviewer.component';
import { CommentspopupComponent } from '../commentspopup/commentspopup.component';

@Component({
  selector: 'app-dtrpopupcomponent',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './dtrpopupcomponent.component.html',
  styleUrl: './dtrpopupcomponent.component.css'
})
export class DtrpopupcomponentComponent {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<DtrpopupcomponentComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];

  ngOnInit(): void {
    this.loadData();

  }


  loadData() {
    this.service.getDtrByUser(this.data.usercode).subscribe(
      (data: any[]) => {
        this.studentSubmissions = data;
        console.log(this.studentSubmissions);
      },
      (error: any) => {
        console.error('Error fetching student submissions:', error);
      }
    );
  }

  viewFile(submissionId: number, submissionName: string) {
    this.service.downloadDtr(submissionId).subscribe(
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

  downloadSubmission(submissionId: number, submissionName: string) {
    this.service.downloadDtr(submissionId).subscribe(
      (data: any) => {
        saveAs(data, submissionName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }

  toggleApproval(id: number, currentValue: number) {
    let newValue: number;

    if (currentValue === 0) {
      newValue = 1;
    } else if (currentValue === 1) {
      newValue = -1;
    } else {
      newValue = 0;
    }
    const requestData = {
      submissionId: id,
      newRemark: newValue
    };
    this.service.toggleDtrRemark(requestData).subscribe(
      (response) => {
        console.log('Submission remark toggled successfully:', response);

        const submissionIndex = this.studentSubmissions.findIndex(submission => submission.dtr_id === id);
        if (submissionIndex !== -1) {
          this.studentSubmissions[submissionIndex].remarks = newValue;
        }
      },
      (error) => console.error('Error toggling Submission remark:', error)
    );
  }

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog2.open(CommentspopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "95%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'dtr'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
