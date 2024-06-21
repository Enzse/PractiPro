import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { Observable, Subscription, map } from 'rxjs';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';
import { AddseminarpopupComponent } from '../../popups/popups-student/addseminarpopup/addseminarpopup.component';
import { ViewseminarpopupComponent } from '../../popups/popups-student/viewseminarpopup/viewseminarpopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddcertificatepopupComponent } from '../../popups/popups-student/addcertificatepopup/addcertificatepopup.component';
import { PdfviewerComponent } from '../../popups/shared/pdfviewer/pdfviewer.component';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';

@Component({
  selector: 'app-submission-seminars',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, FilterPipe, MatButtonModule, MatMenuModule, MatTooltipModule],
  templateUrl: './submission-seminars.component.html',
  styleUrl: './submission-seminars.component.css'
})
export class SubmissionSeminarsComponent implements OnInit, OnDestroy {
  userId: any;
  user$: Observable<any>;
  datalist: any[] = [];
  origlist: any;
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(private service: AuthService, private dialog: MatDialog, private sanitizer: DomSanitizer, private changeDetection: ChangeDetectionService) {
    this.userId = this.service.getCurrentUserId();
    this.user$ = this.service.getStudentOjtInfo(this.userId).pipe(
      map((res: any) => res.payload[0])
    );
  }

  ngOnInit(): void {
    this.loadData();
    this.subscriptions.add(        
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadData();
          this.user$ = this.service.getStudentOjtInfo(this.userId).pipe(
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
      this.service.getSeminarRecords(this.userId).subscribe((res: any) => {
        this.datalist = res.payload
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
        this.datalist = this.datalist.filter((user: any) => user.event_type === 'Seminar');
        break;
      case 'webinar':
        this.datalist = this.datalist.filter((user: any) => user.event_type === 'Webinar');
        break;
      case 'approved':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Approved');
        break;
      case 'unapproved':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Unapproved');
        break;
      case 'pending':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Pending');
        break;
      case 'certified':
        this.datalist = this.datalist.filter((user: any) => user.certified === 1);
        break;
      case 'notcertified':
        this.datalist = this.datalist.filter((user: any) => user.certified === 0);
        break;
    }
  }

  addSeminar() {
    const popup = this.dialog.open(AddseminarpopupComponent, {
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
      this.service.getSubmissionFile('student_seminar_certificates', seminar_id).subscribe(
        (data: any) => {
          const popup = this.dialog.open(PdfviewerComponent, {
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
    const popup = this.dialog.open(AddcertificatepopupComponent, {
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
          this.service.deletSeminarRecord(id).subscribe((res: any) => {
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
    const popup = this.dialog.open(CommentspopupComponent, {
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
