import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditjobpopupComponent } from '../editjobpopup/editjobpopup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditschedulespopupComponent } from '../editschedulespopup/editschedulespopup.component';
import { TimePipe } from '../../../../pipes/time.pipe';
import { Subscription } from 'rxjs';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { CompanyService } from '../../../../services/api/company.service';

@Component({
    selector: 'app-viewtraineepopup',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TimePipe],
    templateUrl: './viewtraineepopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './viewtraineepopup.component.css'
})
export class ViewtraineepopupComponent implements OnInit, OnDestroy {
  private readonly companyApi = inject(CompanyService);
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

  constructor(private changeDetection: ChangeDetectionService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewtraineepopupComponent>, private dialog2: MatDialog) {
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
      this.companyApi.jobOf(this.data.student.id).subscribe((res: any) => {
        this.studentjob = res.payload[0];
        console.log(this.studentjob);
      }));
  }

  loadSchedules() {
    this.subscriptions.add(
      this.companyApi.schedulesOf(this.data.student.id).subscribe((res: any) => {
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
