
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { saveAs } from 'file-saver';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { MatMenuModule } from '@angular/material/menu';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription } from 'rxjs';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';

@Component({
  selector: 'app-documentationpopup',
  standalone: true,
  imports: [ReactiveFormsModule, FilterPipe, CommonModule, FormsModule, MatButtonModule, MatMenuModule, FormsModule, NgxPaginationModule],
  templateUrl: './documentationpopup.component.html',
  styleUrl: './documentationpopup.component.css'
})
export class DocumentationpopupComponent implements OnInit, OnDestroy {
  constructor(private builder: FormBuilder, private service: AuthService, private changeDetection: ChangeDetectionService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<DocumentationpopupComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];
  origlist: any;
  searchtext: any;
  isLoading = true;
  private subscriptions = new Subscription();
  p: number = 1; /* starting no. of the list */

  ngOnInit(): void {
    this.loadData();
  }
  closePopup() {
    this.dialog.close();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.service.getSubmissionsByStudent('documentations', this.data.student.id).subscribe(
        (res: any) => {
          this.studentSubmissions = res.payload.sort((a: any, b: any) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          this.origlist = this.studentSubmissions;
          this.isLoading = false;
          console.log(this.studentSubmissions);
        },
        (error: any) => {
          console.error('Error fetching student submissions:', error);
        }
      ));
  }

  setFilter(filter: string) {
    this.p = 1;
    this.studentSubmissions = this.origlist;
    switch (filter) {
      case 'all':
        this.studentSubmissions = this.origlist;
        break;
      case 'approved':
        this.studentSubmissions = this.studentSubmissions.filter((user: any) => user.advisor_approval === 'Approved');
        break;
      case 'unapproved':
        this.studentSubmissions = this.studentSubmissions.filter((user: any) => user.advisor_approval === 'Unapproved');
        break;
      case 'pending':
        this.studentSubmissions = this.studentSubmissions.filter((user: any) => user.advisor_approval === 'Pending');
        break;
    }
  }

  viewFile(submissionId: number) {
    this.service.getSubmissionFile('documentations', submissionId).subscribe(
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

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog2.open(CommentspopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "95%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_documentation'
      }
    })
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.loadData()
      }));
  }

  downloadFile(submissionId: number, submissionName: string) {
    this.subscriptions.add(
      this.service.getSubmissionFile('documentations', submissionId).subscribe(
        (data: any) => {
          saveAs(data, submissionName);
        },
        (error: any) => {
          console.error('Error downloading submission:', error);
        }
      ));
  }

  deleteSubmission(submissionId: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.deleteSubmission(submissionId, 'documentations').subscribe((res: any) => {
            Swal.fire({
              title: "The submission has been deleted",
              icon: "success"
            });
            this.loadData();
          }, error => {
            Swal.fire({
              title: "Delete failed",
              text: "You may not have permission to delete this file.",
              icon: "error"
            });
          }));
      }
    });
  }

  onStatusChange(record: any) {
    const updateData = { advisor_approval: record.advisor_approval };
    this.subscriptions.add(
      this.service.updateAdvisorApproval('documentations', record.id, updateData).subscribe(
        res => {
          this.changeDetection.notifyChange(true);
          Swal.fire({
            toast: true,
            position: "top-end",
            backdrop: false,
            title: `Submission successfully set to '${record.advisor_approval}'.`,
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        error => {
          Swal.fire({
            toast: true,
            position: "top-end",
            backdrop: false,
            title: `Error occured. You might no have permission to edit this record.`,
            icon: "error",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      ));
  }


}
