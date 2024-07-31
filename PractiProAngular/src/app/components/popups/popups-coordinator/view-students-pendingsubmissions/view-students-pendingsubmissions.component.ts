import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { Subscription } from 'rxjs';
import { RequirementspopupComponent } from '../requirementspopup/requirementspopup.component';
import { DocumentationpopupComponent } from '../documentationpopup/documentationpopup.component';
import { SeminarspopupComponent } from '../seminarspopup/seminarspopup.component';
import { WarpopupcomponentComponent } from '../warpopupcomponent/warpopupcomponent.component';
import { CoordEvaluationsComponent } from '../../../page-coordinator/coord-evaluations/coord-evaluations.component';
import { FinalreportpopupComponent } from '../finalreportpopup/finalreportpopup.component';

@Component({
  selector: 'app-view-students-pendingsubmissions',
  standalone: true,
  imports: [CommonModule, FilterPipe, FormsModule, RouterLink, RouterLinkActive, MatButtonModule, MatMenuModule],
  templateUrl: './view-students-pendingsubmissions.component.html',
  styleUrl: './view-students-pendingsubmissions.component.css'
})
export class ViewStudentsPendingsubmissionsComponent implements OnInit, OnDestroy {
  studentList: any;
  searchtext: any;
  private subscriptions = new Subscription();
  conditionDisplay: any;

  constructor(private router: Router, private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewStudentsPendingsubmissionsComponent>, private dialog2: MatDialog, private sanitizer: DomSanitizer, private changeDetection: ChangeDetectionService) {

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
      this.service.getStudentsWithPendingSubmissions(this.data.block, this.data.condition).subscribe((res: any) => {
        this.studentList = res.payload.map((user: any) => {
          return { ...user, avatar: '' };
        });

        this.studentList.forEach((student: any) => {
          this.subscriptions.add(
            this.service.getAvatar(student.id).subscribe((res: any) => {
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
        const reqPopup = this.dialog2.open(RequirementspopupComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_doc_count':
        const docPopup = this.dialog2.open(DocumentationpopupComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_sem_count':
        const semPopup = this.dialog2.open(SeminarspopupComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_war_count_advisor':
        const warPopup = this.dialog2.open(WarpopupcomponentComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_sse_count':
        const ssePopup = this.dialog2.open(CoordEvaluationsComponent, {
          enterAnimationDuration: "350ms",
          exitAnimationDuration: "200ms",
          width: "80%",
          data: {
            student: student
          }
        })
        break;
      case 'pending_frp_count':
        const frpPopup = this.dialog2.open(FinalreportpopupComponent, {
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
