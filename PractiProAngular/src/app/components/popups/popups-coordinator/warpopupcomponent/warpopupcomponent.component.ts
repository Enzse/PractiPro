
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { WarAccordionComponent } from '../../../widgets/accordion/war-accordion/war-accordion.component';
import { TimePipe } from '../../../../pipes/time.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';



@Component({
  selector: 'app-warpopupcomponent',
  standalone: true,
  imports: [WarAccordionComponent, CommonModule, TimePipe, FormsModule, NgxPaginationModule, MatTooltipModule],
  templateUrl: './warpopupcomponent.component.html',
  styleUrl: './warpopupcomponent.component.css'
})
export class WarpopupcomponentComponent implements OnInit, OnDestroy {
  constructor(private service: AuthService, private changeDetection: ChangeDetectionService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<WarpopupcomponentComponent>, private dialog2: MatDialog) { }

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
      this.service.getWarRecords(this.data.student.id, null).subscribe((res: any) => {
        this.recordsList = res.payload.filter((record: any) => record.isSubmitted === 1 && record.supervisor_approval === 'Approved')
        this.recordsList = this.recordsList.sort((a: any, b: any) => {
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
        this.service.getWarActivities(records.id).subscribe((res: any) => {
          res.payload.forEach((activity: any) => {
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
      this.service.updateAdvisorApproval('student_war_records', record.id, updateData).subscribe(
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
    // popup.afterClosed().subscribe(res => {
    //   this.loadRecords()
    // });
  }

}
