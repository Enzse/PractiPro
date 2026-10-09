
import { Component, OnInit, Inject, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommentsDialogComponent } from '../../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { AccordionComponent } from '../../../../shared/components/accordion/accordion.component';
import { TimePipe } from '../../../../shared/pipes/time.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { SubmissionService } from '../../../../core/api/submission.service';
import { WarService } from '../../../../core/api/war.service';



@Component({
    selector: 'app-coordinator-weekly-report-dialog',
    imports: [AccordionComponent, CommonModule, TimePipe, FormsModule, NgxPaginationModule, MatTooltipModule],
    templateUrl: './coordinator-weekly-report-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-weekly-report-dialog.component.css'
})
export class CoordinatorWeeklyReportDialogComponent implements OnInit, OnDestroy {
  private readonly submissionApi = inject(SubmissionService);
  private readonly warApi = inject(WarService);
  constructor(private changeDetection: DataRefreshService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<CoordinatorWeeklyReportDialogComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];
  isLoading: boolean = true;
  recordsList: any[] = [];
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.loadRecords();
  }
  closePopup() {
    this.dialog.close();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadRecords() {
    this.subscriptions.add(
      this.warApi.records(this.data.student.id, null).subscribe((res) => {
        this.recordsList = res.payload.filter((record) => record.isSubmitted === 1 && record.supervisor_approval === 'Approved')
        this.recordsList = this.recordsList.sort((a, b) => {
          return b.week - a.week
        })
        this.isLoading = false;
        this.loadWarActivities();
      })
    )
  }

  recordActivities: any[] = [];
  loadWarActivities() {
    this.subscriptions.add(
      this.recordsList.forEach(records => {
        this.warApi.activities(records.id).subscribe((res) => {
          res.payload.forEach((activity) => {
            this.recordActivities.push(activity)
          });
        })
      })
    )
  }

  getActivitiesForRecord(recordId: number): any[] {
    return this.recordActivities.filter(activity => activity.war_id === recordId);
  }


  onStatusChange(record: any) {
    const updateData = { advisor_approval: record.advisor_approval };
    this.subscriptions.add(
      this.submissionApi.setAdvisorApproval('student_war_records', record.id, updateData).subscribe(
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

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog2.open(CommentsDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "95%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_war'
      }
    })
    // popup.afterClosed().subscribe(res => {
    //   this.loadRecords()
    // });
  }

}
