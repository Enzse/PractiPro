import { Component, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';

import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SubmissionsDialogComponent } from '../../../shared/dialogs/submissions-dialog/submissions-dialog.component';
import { RequirementsDialogComponent } from '../../../shared/dialogs/requirements-dialog/requirements-dialog.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { SelectedClassService } from '../selected-class.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { StudentProfileDialogComponent } from '../dialogs/student-profile-dialog/student-profile-dialog.component';
import { Subscription } from 'rxjs';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { StudentService } from '../../../core/api/student.service';
import { StudentOjtStatus } from '../../../core/models/student';


@Component({
    selector: 'app-coordinator-registrations',
    imports: [FormsModule, FilterPipe, NgxPaginationModule, MatButtonModule, MatMenuModule],
    templateUrl: './coordinator-registrations.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-registrations.component.css'
})
export class CoordinatorRegistrationsComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);

  constructor(private changeDetection: DataRefreshService, private dialog: MatDialog, private blockService: SelectedClassService) { }
  students: any;
  studentlist: StudentOjtStatus[] | undefined;
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
    const popup = this.dialog.open(SubmissionsDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "auto",
      data: {
        usercode: code
      }
    })
  }

  viewSubmissions(student: any) {
    const popup = this.dialog.open(RequirementsDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        student: student,
      }
    })
  }

  viewProfile(student: any) {
    const popup = this.dialog.open(StudentProfileDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "auto",
      data: {
        student_id: student
      }
    })
  }

}