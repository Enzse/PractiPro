import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FinalReportDialogComponent } from '../dialogs/final-report-dialog/final-report-dialog.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { SelectedClassService } from '../selected-class.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { EvaluationDialogComponent } from '../dialogs/evaluation-dialog/evaluation-dialog.component';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { Subscription } from 'rxjs';
import { StudentProfileDialogComponent } from '../dialogs/student-profile-dialog/student-profile-dialog.component';
import { StudentService } from '../../../core/api/student.service';

@Component({
    selector: 'app-coordinator-evaluations',
    imports: [CommonModule, FormsModule, FilterPipe, NgxPaginationModule, MatMenuModule, MatButtonModule],
    templateUrl: './coordinator-evaluations.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-evaluations.component.css'
})
export class CoordinatorEvaluationsComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);

  constructor(private dialog: MatDialog, private blockService: SelectedClassService, private changeDetection: DataRefreshService) {
  }

  Coordinator: any;
  students: any;
  studentlist: any[] = [];
  searchtext: any;
  currentBlock: any;
  private subscriptions = new Subscription();
  isLoading: boolean = false;
  p: number = 1; /* starting no. of the list */

  ngOnInit(): void {
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
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadHeldStudents() {
    this.isLoading = true;
    this.subscriptions.add(
    this.studentApi.inClass(this.currentBlock).subscribe(res => {
      this.studentlist = res.payload;
      this.studentlist = this.studentlist.filter((student) => student.TotalHoursWorked >= 200);
      this.isLoading = false;
      console.log(this.studentlist);
    }, err => {
      this.isLoading = false;
      console.error(err);
    }));
  }

  viewEvaluations(student: any) {
    const popup = this.dialog.open(EvaluationDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }

  viewProfile(student:any) {
    const popup = this.dialog.open(StudentProfileDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "auto",
      data: {
        student: student
      }
    })
  }

}
