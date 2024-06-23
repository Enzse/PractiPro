
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { saveAs } from 'file-saver';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import Swal from 'sweetalert2';
import { MatMenuModule } from '@angular/material/menu';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-warpopupcomponent',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, FormsModule, NgxPaginationModule],
  templateUrl: './warpopupcomponent.component.html',
  styleUrl: './warpopupcomponent.component.css'
})
export class WarpopupcomponentComponent implements OnInit, OnDestroy {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<WarpopupcomponentComponent>, private dialog2: MatDialog) { }
  searchtext: any;
  studentSubmissions: any[] = [];
  origlist: any;
  isLoading: boolean = true;
  private subscriptions = new Subscription();
  p: number = 1;

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.service.getSubmissionsByStudent('war', this.data.usercode).subscribe(
        (res) => {
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
    this.studentSubmissions = this.origlist;
    switch (filter) {
      case 'all':
        this.studentSubmissions = this.origlist;
        break;
      case 'a-approved':
        this.studentSubmissions = this.studentSubmissions.filter((user: any) => user.advisor_approval === 'Approved');
        break;
      case 'a-unapproved':
        this.studentSubmissions = this.studentSubmissions.filter((user: any) => user.advisor_approval === 'Unapproved');
        break;
      case 'a-pending':
        this.studentSubmissions = this.studentSubmissions.filter((user: any) => user.advisor_approval === 'Pending');
        break;
      case 's-approved':
        this.studentSubmissions = this.studentSubmissions.filter((user: any) => user.supervisor_approval === 'Approved');
        break;
      case 's-unapproved':
        this.studentSubmissions = this.studentSubmissions.filter((user: any) => user.supervisor_approval === 'Unapproved');
        break;
      case 's-pending':
        this.studentSubmissions = this.studentSubmissions.filter((user: any) => user.supervisor_approval === 'Pending');
        break;
    }
  }

  viewFile(submissionId: number) {
    this.subscriptions.add(
      this.service.getSubmissionFile('war', submissionId).subscribe(
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
      ));
  }

  downloadFile(submissionId: number, submissionName: string) {
    this.subscriptions.add(
      this.service.getSubmissionFile('war', submissionId).subscribe(
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
          this.service.deleteSubmission(submissionId, 'war').subscribe((res: any) => {
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
      this.service.updateAdvisorApproval('war', record.id, updateData).subscribe(
        res => {
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
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.loadData()
      }));
  }

}
