import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { Observable, Subscription, map } from 'rxjs';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { AddSeminarDialogComponent } from '../../../shared/dialogs/add-seminar-dialog/add-seminar-dialog.component';
import { SeminarDialogComponent } from '../dialogs/seminar-dialog/seminar-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddCertificateDialogComponent } from '../dialogs/add-certificate-dialog/add-certificate-dialog.component';
import { PdfViewerDialogComponent } from '../../../shared/dialogs/pdf-viewer-dialog/pdf-viewer-dialog.component';
import Swal from 'sweetalert2';
import { CommentsDialogComponent } from '../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { SubmissionService } from '../../../core/api/submission.service';
import { SeminarService } from '../../../core/api/seminar.service';

@Component({
    selector: 'app-student-seminars',
    imports: [CommonModule, DatePipe, FormsModule, FilterPipe, MatButtonModule, MatMenuModule, MatTooltipModule],
    templateUrl: './student-seminars.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './student-seminars.component.css'
})
export class StudentSeminarsComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly seminarApi = inject(SeminarService);
  userId: number;
  user$: Observable<any>;
  datalist: any[] = [];
  origlist: any;
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer, private changeDetection: DataRefreshService) {
    this.userId = this.session.requireUserId();
    this.user$ = this.studentApi.ojtStatus(this.userId).pipe(
      map((res: any) => res.payload[0])
    );
  }

  ngOnInit(): void {
    this.loadData();
    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadData();
          this.user$ = this.studentApi.ojtStatus(this.userId).pipe(
            map((res: any) => res.payload[0])
          );
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.seminarApi.forStudent(this.userId).subscribe((res) => {
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

  addSeminar() {
    const popup = this.dialog.open(AddSeminarDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: 'auto',
      data: {
        id: this.userId
      }
    });
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


  addCertificate(seminar_id: number) {
    const popup = this.dialog.open(AddCertificateDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        id: seminar_id
      }
    });
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
            this.changeDetection.notifyChange(true);
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
