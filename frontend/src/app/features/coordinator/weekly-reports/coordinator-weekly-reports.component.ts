import { Component, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';

import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CoordinatorWeeklyReportDialogComponent } from '../dialogs/weekly-report-dialog/coordinator-weekly-report-dialog.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { SelectedClassService } from '../selected-class.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { StudentProfileDialogComponent } from '../dialogs/student-profile-dialog/student-profile-dialog.component';
import { Subscription } from 'rxjs';
import { StudentService } from '../../../core/api/student.service';

@Component({
    selector: 'app-coordinator-weekly-reports',
    imports: [FormsModule, FilterPipe, NgxPaginationModule, MatButtonModule, MatMenuModule],
    templateUrl: './coordinator-weekly-reports.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-weekly-reports.component.css'
})
export class CoordinatorWeeklyReportsComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);
  constructor(private dialog: MatDialog, private blockService: SelectedClassService) {}
  Coordinator: any;
  students: any;  
  studentlist: any;
  searchtext: any;
  currentBlock: any;
  isLoading: boolean = false;
  private subscriptions = new Subscription();
  p: number = 1;

  ngOnInit(): void {
    this.blockService.selectedBlock$.subscribe(block => {
      this.currentBlock = block;
        this.loadHeldStudents();
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
      this.studentlist = this.studentlist.filter((student: any) => student.registration_status === 1);
      this.isLoading = false;
      console.log(this.studentlist);
    }, err => {
      this.isLoading = false;
      console.error(err);
    }));
  }
  
  viewSubmissions(code: any) {
    const popup = this.dialog.open(CoordinatorWeeklyReportDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        usercode: code
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
