import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationDialogComponent } from '../dialogs/documentation-dialog/documentation-dialog.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { SelectedClassService } from '../selected-class.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule, } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { StudentProfileDialogComponent } from '../dialogs/student-profile-dialog/student-profile-dialog.component';
import { CoordinatorDtrDialogComponent } from '../dialogs/dtr-dialog/coordinator-dtr-dialog.component';
import { SeminarsDialogComponent } from '../dialogs/seminars-dialog/seminars-dialog.component';
import { CoordinatorWeeklyReportDialogComponent } from '../dialogs/weekly-report-dialog/coordinator-weekly-report-dialog.component';
import { EvaluationDialogComponent } from '../dialogs/evaluation-dialog/evaluation-dialog.component';
import { FinalReportDialogComponent } from '../dialogs/final-report-dialog/final-report-dialog.component';
import { Subscription } from 'rxjs';
import { StudentService } from '../../../core/api/student.service';

@Component({
    selector: 'app-coordinator-submissions',
    imports: [CommonModule, FormsModule, FilterPipe, NgxPaginationModule, MatMenuModule, MatButtonModule],
    templateUrl: './coordinator-submissions.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-submissions.component.css'
})
export class CoordinatorSubmissionsComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);
  constructor(private dialog: MatDialog, private blockService: SelectedClassService) { }
  Coordinator: any;
  students: any;
  studentlist: any;
  searchtext: any;
  currentBlock: any;
  isLoading: boolean = false;
  p: number = 1; /* starting no. of the list */
  private subscriptions = new Subscription();


  ngOnInit(): void {
    this.subscriptions.add(
      this.blockService.selectedBlock$.subscribe(block => {
        this.currentBlock = block;
        if (this.currentBlock) {
          this.loadHeldStudents();
        } else {
          console.log(`Submissions: no block selected`);
        }
        console.log(`Submissions: ${this.currentBlock}`);
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
        this.studentlist = this.studentlist.filter((student: any) => student.registration_status === 1);
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
      }));
  }


  viewDocumentations(student: any) {
    const popup = this.dialog.open(DocumentationDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewDtrs(student: any) {
    const popup = this.dialog.open(CoordinatorDtrDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewSeminars(student: any) {
    const popup = this.dialog.open(SeminarsDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewWars(student: any) {
    const popup = this.dialog.open(CoordinatorWeeklyReportDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewEvaluations(student: any) {
    const popup = this.dialog.open(EvaluationDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewFinalReports(student: any) {
    const popup = this.dialog.open(FinalReportDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }

  viewProfile(student: any) {
    const popup = this.dialog.open(StudentProfileDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "auto",
      data: {
        student_id: student
      }
    })
  }

}
