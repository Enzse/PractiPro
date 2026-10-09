import { Component, Inject, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FilterPipe } from '../../../../shared/pipes/filter.pipe';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { Subscription } from 'rxjs';
import { RequirementsDialogComponent } from '../../../../shared/dialogs/requirements-dialog/requirements-dialog.component';
import { DocumentationDialogComponent } from '../documentation-dialog/documentation-dialog.component';
import { SeminarsDialogComponent } from '../seminars-dialog/seminars-dialog.component';
import { CoordinatorWeeklyReportDialogComponent } from '../weekly-report-dialog/coordinator-weekly-report-dialog.component';
import { CoordinatorEvaluationsComponent } from '../../evaluations/coordinator-evaluations.component';
import { FinalReportDialogComponent } from '../final-report-dialog/final-report-dialog.component';
import { MediaService } from '../../../../core/api/media.service';
import { ReportService } from '../../../../core/api/report.service';

@Component({
    selector: 'app-pending-submissions-dialog',
    imports: [FilterPipe, FormsModule, MatButtonModule, MatMenuModule],
    templateUrl: './pending-submissions-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './pending-submissions-dialog.component.css'
})
export class PendingSubmissionsDialogComponent implements OnInit, OnDestroy {
  private readonly mediaApi = inject(MediaService);
  private readonly reportApi = inject(ReportService);
  studentList: any;
  searchtext: any;
  private subscriptions = new Subscription();
  conditionDisplay: any;

  constructor(private router: Router, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<PendingSubmissionsDialogComponent>, private dialog2: MatDialog, private sanitizer: DomSanitizer, private changeDetection: DataRefreshService) {

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  closePopup() {
    this.dialog.close();
  }
  ngOnInit(): void {
    this.loadData()

    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadData();
        }
      })
    )
  }

  loadData() {
    this.subscriptions.add(
      this.reportApi.studentsWithPendingSubmissions(this.data.block, this.data.condition).subscribe((res) => {
        this.studentList = res.payload.map((user: any) => {
          return { ...user, avatar: '' };
        });

        this.studentList.forEach((student: any) => {
          this.subscriptions.add(
            this.mediaApi.avatar(student.id).subscribe((res) => {
              if (res.size > 0) {
                const url = URL.createObjectURL(res);
                student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
              }
            }))
        });
        console.log(this.studentList)
      })
    )
  }



  viewSubmissions(student: any) {
    switch (this.data.condition) {
      case 'pending_req_count':
        const reqPopup = this.dialog2.open(RequirementsDialogComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_doc_count':
        const docPopup = this.dialog2.open(DocumentationDialogComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_sem_count':
        const semPopup = this.dialog2.open(SeminarsDialogComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_war_count_advisor':
        const warPopup = this.dialog2.open(CoordinatorWeeklyReportDialogComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_sse_count':
        const ssePopup = this.dialog2.open(CoordinatorEvaluationsComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_frp_count':
        const frpPopup = this.dialog2.open(FinalReportDialogComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
    }
  }
}
