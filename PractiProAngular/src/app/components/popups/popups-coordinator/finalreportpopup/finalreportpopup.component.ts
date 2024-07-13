import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';


@Component({
  selector: 'app-finalreportpopup',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, FormsModule, NgxPaginationModule],
  templateUrl: './finalreportpopup.component.html',
  styleUrl: './finalreportpopup.component.css'
})
export class FinalreportpopupComponent implements OnInit, OnDestroy {
  constructor(private changeDetection: ChangeDetectionService, private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<FinalreportpopupComponent>, private dialog2: MatDialog) { }

  submittedReport: any;
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
      this.service.getFinalReport(this.data.student.id).subscribe((res: any) => {
        this.submittedReport = res.payload[0];
        this.isLoading = false;
        console.log(this.submittedReport);
      }));
  }

  onStatusChange(record: any) {
    const updateData = { advisor_approval: record.advisor_approval };
    this.subscriptions.add(
      this.service.updateAdvisorApproval('student_final_reports', record.id, updateData).subscribe(
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
          this.service.deleteSubmission(submissionId, 'finalreports').subscribe((res: any) => {
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

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog2.open(CommentspopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "95%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_finalreports'
      }
    })
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.loadData()
      }));
  }


  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
