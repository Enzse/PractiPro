import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ViewhiringrequestsComponent } from '../../popups/popups-student/viewhiringrequests/viewhiringrequests.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TimePipe } from '../../../pipes/time.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, NavbarComponent, RouterLink, RouterLinkActive, CommonModule, TimePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  constructor(private service: AuthService, private dialog: MatDialog) { }
  registrationStatus: any;
  studentRequirements: any[] = [];
  student: any;
  studentjob: any;
  hiringRequests: any[] = [];
  private subscriptions = new Subscription();
  userId: any = this.service.getCurrentUserId();
  schedules = [
    { day_of_week: 'Monday', start_time: '', end_time: '' },
    { day_of_week: 'Tuesday', start_time: '', end_time: '' },
    { day_of_week: 'Wednesday', start_time: '', end_time: '' },
    { day_of_week: 'Thursday', start_time: '', end_time: '' },
    { day_of_week: 'Friday', start_time: '', end_time: '' },
    { day_of_week: 'Saturday', start_time: '', end_time: '' },
    { day_of_week: 'Sunday', start_time: '', end_time: '' }
  ];


  ngOnInit(): void {
    this.loadData();
    this.loadSchedules();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadSchedules() {
    this.subscriptions.add(
    this.service.getStudentSchedules(this.userId).subscribe((res: any) => {
      this.schedules = res.payload
      console.log(this.schedules)
    }));
  }

  loadData() {
    if (this.userId) {
      this.subscriptions.add(
        this.service.getStudentOjtInfo(this.userId).subscribe(
          (res: any) => {
            this.registrationStatus = res.payload[0].registrationstatus;
            this.student = res.payload[0];
            if (!this.registrationStatus)
              this.subscriptions.add(
                this.service.getStudentRequirements(this.userId).subscribe(
                  (res: any) => {
                    this.studentRequirements = res.payload;
                  },
                  (error: any) => {
                    console.error('Error fetching student requirements:', error);
                  }
                ));
            if (this.registrationStatus && !this.student.company_id)
              this.subscriptions.add(
                this.service.getHiringRequests(this.userId).subscribe(
                  (res: any) => {
                    this.hiringRequests = res.payload;
                  }
                ));
            if (this.registrationStatus && this.student.company_id)
            console.log(this.userId);
              this.subscriptions.add(
                this.service.getStudentJob(this.userId).subscribe((res: any) => {
                  this.studentjob = res.payload[0];
                }
                ));
          },
          (error: any) => {
            console.error('Error fetching data.', error);
          }
        ));
    }
  }


  


  viewHiringRequests(id: number) {
    const popup = this.dialog.open(ViewhiringrequestsComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: 'auto',
      data: {
        student_id: this.userId
      }
    });
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.loadData();
      })
    );
  }


}
