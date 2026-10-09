import { Component, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';

import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewsubmissionsComponent } from '../../popups/popups-admin/viewsubmissions/viewsubmissions.component';
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
import { StudentService } from '../../../services/api/student.service';


@Component({
    selector: 'app-coordinator-submission',
    imports: [FormsModule, FilterPipe, NgxPaginationModule, MatButtonModule, MatMenuModule],
    templateUrl: './coordinator-submission.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-submission.component.css'
})
export class CoordinatorSubmissionComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);

  constructor(private changeDetection: ChangeDetectionService, private dialog: MatDialog, private blockService: BlockService) { }
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
      this.studentApi.inClass(this.currentBlock).subscribe(res => {
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
        student_id: student
      }
    })
  }

}