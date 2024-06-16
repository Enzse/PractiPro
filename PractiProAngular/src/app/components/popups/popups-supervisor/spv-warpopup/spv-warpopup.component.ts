
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-spv-warpopup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spv-warpopup.component.html',
  styleUrl: './spv-warpopup.component.css'
})
export class SpvWarpopupComponent implements OnInit, OnDestroy {
  constructor(private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SpvWarpopupComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];
  isLoading: boolean = true;

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    
  }

  loadData() {
    this.service.getSubmissionsByStudent('war', this.data.student.id).subscribe(
      (res) => {
        this.studentSubmissions = res.payload;
        this.isLoading = false;
        console.log(this.studentSubmissions);
      },
      (error: any) => {
        console.error('Error fetching student submissions:', error);
      }
    );
  }

  viewFile(submissionId: number) {
    this.service.getSubmissionFile('war',submissionId).subscribe(
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

  downloadFile(submissionId: number, submissionName: string) {
    this.service.getSubmissionFile('war',submissionId).subscribe(
      (data: any) => {
        saveAs(data, submissionName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }

  onStatusChange(record: any) {
    const updateData = { supervisor_approval: record.supervisor_approval };
    this.service.updateSupervisorApproval('war', record.id, updateData).subscribe(
      res => {
        console.log('Status updated successfully:', res);
      },
      error => {
        console.error('Error updating status:', error);
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
    this.service.toggleSubmissionRemark('war',requestData).subscribe(
      (response) => {
        console.log('Submission remark toggled successfully:', response);

        const submissionIndex = this.studentSubmissions.findIndex(submission => submission.id === id);
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
        table: 'comments_war'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
