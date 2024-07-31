import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditjobpopupComponent } from '../editjobpopup/editjobpopup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditschedulespopupComponent } from '../editschedulespopup.component.ts/editschedulespopup.component.ts.component';
import { TimePipe } from '../../../../pipes/time.pipe';
import { Subscription } from 'rxjs';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';

@Component({
  selector: 'app-viewtraineepopup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TimePipe],
  templateUrl: './viewtraineepopup.component.html',
  styleUrl: './viewtraineepopup.component.css'
})
export class ViewtraineepopupComponent implements OnInit, OnDestroy {
  studentjob: any
  changeDetected: any;
  schedules = [
    { day_of_week: 'Monday', start_time: '', end_time: '' },
    { day_of_week: 'Tuesday', start_time: '', end_time: '' },
    { day_of_week: 'Wednesday', start_time: '', end_time: '' },
    { day_of_week: 'Thursday', start_time: '', end_time: '' },
    { day_of_week: 'Friday', start_time: '', end_time: '' },
    { day_of_week: 'Saturday', start_time: '', end_time: '' },
    { day_of_week: 'Sunday', start_time: '', end_time: '' }
  ];
  private subscriptions = new Subscription();

  constructor(private changeDetection: ChangeDetectionService, private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewtraineepopupComponent>, private dialog2: MatDialog) {
    this.changeDetected = [false];
  }


  ngOnInit(): void {
    this.loadData()
    this.loadSchedules();
  }
  closePopup() {
    this.dialog.close();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.service.getStudentJob(this.data.student.id).subscribe((res: any) => {
        this.studentjob = res.payload[0];
        console.log(this.studentjob);
      }));
  }

  loadSchedules() {
    this.subscriptions.add(
      this.service.getStudentSchedules(this.data.student.id).subscribe((res: any) => {
        this.schedules = res.payload
        console.log(this.schedules)
      }));
  }


  editJob() {
    const popup = this.dialog2.open(EditjobpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: 'auto',
      data: {
        student: this.data.student,
        studentjob: this.studentjob
      }
    });
    popup.afterClosed().subscribe(res => {
      const changeDetected = res;
      if (changeDetected) {
        console.log("Change detected!");
        this.loadData();
        this.changeDetected = true;
      }
    })
  }



  assignSchedules() {
    const popup = this.dialog2.open(EditschedulespopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: 'auto',
      data: {
        student: this.data.student,
        schedules: this.schedules
      }
    });
    popup.afterClosed().subscribe(res => {
      const changeDetected = res;
      if (changeDetected) {
        console.log("Change detected!");
        this.loadSchedules();
        this.changeDetected = true;
      }
    })
  }


}
