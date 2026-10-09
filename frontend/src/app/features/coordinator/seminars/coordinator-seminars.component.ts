import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { SelectedClassService } from '../selected-class.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { StudentProfileDialogComponent } from '../dialogs/student-profile-dialog/student-profile-dialog.component';
import { SeminarsDialogComponent } from '../dialogs/seminars-dialog/seminars-dialog.component';
import { Subscription } from 'rxjs';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { StudentService } from '../../../core/api/student.service';

@Component({
    selector: 'app-coordinator-seminars',
    imports: [FormsModule, FilterPipe, NgxPaginationModule, MatMenuModule, MatButtonModule],
    templateUrl: './coordinator-seminars.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-seminars.component.css'
})
export class CoordinatorSeminarsComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);
  constructor(private changeDetection: DataRefreshService, private dialog: MatDialog, private blockService: SelectedClassService) { }

  Coordinator: any;
  students: any;
  studentlist: any;
  searchtext: any;
  currentBlock: any;
  isLoading: boolean = false;
  private subscriptions = new Subscription();
  p: number = 1; /* starting no. of the list */

  ngOnInit(): void {
    this.subscriptions.add(
    this.blockService.selectedBlock$.subscribe(block => {
      this.currentBlock = block;
      this.loadHeldStudents();
    }));
    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadHeldStudents();
        }
      })
    );
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

  viewSubmissions(student: any) {
    const popup = this.dialog.open(SeminarsDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }

  viewProfile(student: any) {
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
