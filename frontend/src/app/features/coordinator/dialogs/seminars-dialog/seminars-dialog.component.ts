import { Component, OnInit, OnDestroy, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../../shared/pipes/filter.pipe';
import { Observable, Subscription, map } from 'rxjs';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { AddSeminarDialogComponent } from '../../../../shared/dialogs/add-seminar-dialog/add-seminar-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PdfViewerDialogComponent } from '../../../../shared/dialogs/pdf-viewer-dialog/pdf-viewer-dialog.component';
import Swal from 'sweetalert2';
import { CommentsDialogComponent } from '../../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { SubmissionService } from '../../../../core/api/submission.service';
import { SeminarService } from '../../../../core/api/seminar.service';

@Component({
    selector: 'app-seminars-dialog',
    imports: [CommonModule, DatePipe, FormsModule, FilterPipe, MatButtonModule, MatMenuModule, MatTooltipModule],
    templateUrl: './seminars-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './seminars-dialog.component.css'
})
export class SeminarsDialogComponent {
  private readonly submissionApi = inject(SubmissionService);
  private readonly seminarApi = inject(SeminarService);
  datalist: any[] = [];
  origlist: any;
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<SeminarsDialogComponent>, private dialog: MatDialog, private sanitizer: DomSanitizer, private changeDetection: DataRefreshService) {

  }

  ngOnInit(): void {
    this.loadData();
    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadData();
        }
      })
    );
  }
  closePopup() {
    this.dialogRef.close()
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.seminarApi.forStudent(this.data.student.id).subscribe((res) => {
        this.datalist = res.payload.sort((a, b) => {
          return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
        })
        this.origlist = this.datalist;
      })
    );
  }

  setFilter(filter: string) {
    this.datalist = this.origlist;
    switch (filter) {
      case 'all':
        this.datalist = this.origlist;
        break;
      case 'seminar':
        this.datalist = this.datalist.filter((user) => user.event_type === 'Seminar');
        break;
      case 'webinar':
        this.datalist = this.datalist.filter((user) => user.event_type === 'Webinar');
        break;
      case 'approved':
        this.datalist = this.datalist.filter((user) => user.advisor_approval === 'Approved');
        break;
      case 'unapproved':
        this.datalist = this.datalist.filter((user) => user.advisor_approval === 'Unapproved');
        break;
      case 'pending':
        this.datalist = this.datalist.filter((user) => user.advisor_approval === 'Pending');
        break;
      case 'certified':
        this.datalist = this.datalist.filter((user) => user.certified === 1);
        break;
      case 'notcertified':
        this.datalist = this.datalist.filter((user) => user.certified === 0);
        break;
    }
  }

  viewCertificate(seminar_id: number) {
    this.subscriptions.add(
      this.submissionApi.download('student_seminar_certificates', seminar_id).subscribe(
        (data: any) => {
          const popup = this.dialog.open(PdfViewerDialogComponent, {
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

  onStatusChange(record: any) {
    const updateData = { advisor_approval: record.advisor_approval };
    this.submissionApi.setAdvisorApproval('student_seminar_records', record.id, updateData).subscribe(
      res => {
        this.changeDetection.notifyChange(true);
        Swal.fire({
          toast: true,
          position: "top-end",
          backdrop: false,
          title: `Record successfully set to '${record.advisor_approval}'.`,
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
    );
  }

  deleteRecord(id: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.seminarApi.delete(id).subscribe((res) => {
            Swal.fire({
              title: "Successfully deleted record!",
              icon: "success"
            });
            this.loadData();

          }))
      }
    });
  }

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog.open(CommentsDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_seminar_records'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
