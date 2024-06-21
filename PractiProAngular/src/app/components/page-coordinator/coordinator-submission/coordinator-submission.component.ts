import { Component, OnDestroy } from '@angular/core';
import { CoordNavbarComponent } from '../coord-navbar/coord-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewsubmissionsComponent } from '../../popups/popups-admin/viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../../popups/popups-admin/reviewsubmissions/reviewsubmissions.component';
import { RequirementspopupComponent } from '../../popups/popups-coordinator/requirementspopup/requirementspopup.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { BlockService } from '../../../services/block.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ViewprofilepopupComponent } from '../../popups/shared/viewprofilepopup/viewprofilepopup.component';
import { Subscription } from 'rxjs';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';


@Component({
  selector: 'app-coordinator-submission',
  standalone: true,
  imports: [CoordNavbarComponent, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent, FormsModule, FilterPipe, NgxPaginationModule, MatButtonModule, MatMenuModule],
  templateUrl: './coordinator-submission.component.html',
  styleUrl: './coordinator-submission.component.css'
})
export class CoordinatorSubmissionComponent implements OnInit, OnDestroy {

  constructor(private changeDetection: ChangeDetectionService, private service: AuthService, private dialog: MatDialog, private blockService: BlockService) { }
  students: any;
  studentlist: any;
  searchtext: any;
  currentBlock: any;
  private subscriptions = new Subscription();
  isLoading: boolean = false;
  p: number = 1; /* starting no. of the list */


  ngOnInit(): void {
    this.subscriptions.add(
      this.blockService.selectedBlock$.subscribe(block => {
        this.currentBlock = block;
        this.loadHeldStudents();
        this.subscriptions.add(
          this.changeDetection.changeDetected$.subscribe(changeDetected => {
            if (changeDetected) {
              this.loadHeldStudents();
            }
          })
        );
      }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadHeldStudents() {
    this.isLoading = true;
    this.subscriptions.add(
      this.service.getAllStudentsFromClass(this.currentBlock).subscribe(res => {
        this.studentlist = res.payload;
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
        console.error(err);
      }));
  }


  viewRequirementsStatus(code: any) {
    const popup = this.dialog.open(ViewsubmissionsComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "auto",
      data: {
        usercode: code
      }
    })
  }

  viewSubmissions(student: any) {
    const popup = this.dialog.open(RequirementspopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        student: student,
      }
    })
  }

  viewProfile(student: any) {
    const popup = this.dialog.open(ViewprofilepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "auto",
      data: {
        student: student
      }
    })
  }

}