import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewhiringrequestsComponent } from '../../popups/popups-student/viewhiringrequests/viewhiringrequests.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TimePipe } from '../../../pipes/time.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionService } from '../../../services/session.service';
import { StudentService } from '../../../services/api/student.service';
import { CompanyService } from '../../../services/api/company.service';
import { StudentOjtStatus } from '../../../models/student';
import { Job } from '../../../models/company';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, TimePipe, MatTooltipModule],
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly companyApi = inject(CompanyService);

  constructor(private dialog: MatDialog) { }
  registrationStatus: number | null | undefined;
  studentRequirements: any[] = [];
  student: StudentOjtStatus | undefined;
  studentjob: Job | undefined;
  hiringRequests: any[] = [];
  isCompleted: boolean = false;
  private subscriptions = new Subscription();
  userId: any = this.session.requireUserId();
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
      this.companyApi.schedulesOf(this.userId).subscribe((res) => {
        this.schedules = res.payload
      }));
  }

  loadData() {

    if (this.userId) {
      this.subscriptions.add(
        this.studentApi.ojtStatus(this.userId).subscribe((res) => {
            this.registrationStatus = res.payload[0].registration_status;
            const student = res.payload[0];
            this.student = student;

            if (Number(student.TotalHoursWorked) >= 200 &&
              Number(student.TotalSeminarHours) >= 50 &&
              student.evaluation_status === 'Completed!' &&
              student.exitpoll_status === 'Completed!') {
              this.isCompleted = true;
            }

            if (!this.registrationStatus)
              this.subscriptions.add(
                this.studentApi.requirements(this.userId).subscribe((res) => {
                    this.studentRequirements = res.payload;
                  },
                  (error: any) => {
                    console.error('Error fetching student requirements:', error);
                  }
                ));
            if (this.registrationStatus && !this.student.company_id)
              this.subscriptions.add(
                this.companyApi.hiringRequestsOf(this.userId).subscribe((res) => {
                    this.hiringRequests = res.payload;
                  }
                ));
            if (this.registrationStatus && this.student.company_id)
              console.log(this.userId);
            this.subscriptions.add(
              this.companyApi.jobOf(this.userId).subscribe((res) => {
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
