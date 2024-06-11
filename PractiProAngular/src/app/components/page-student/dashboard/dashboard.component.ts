import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ViewhiringrequestsComponent } from '../../popups/popups-student/viewhiringrequests/viewhiringrequests.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, NavbarComponent, RouterLink, RouterLinkActive, CommonModule],
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


  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    const userId = this.service.getCurrentUserId();

    if (userId) {
      this.subscriptions.add(
        this.service.getStudentOjtInfo(userId).subscribe(
          (res: any) => {
            this.registrationStatus = res.payload[0].registrationstatus;
            this.student = res.payload[0];
            if (!this.registrationStatus)
              this.subscriptions.add(
                this.service.getStudentRequirements(userId).subscribe(
                  (res: any) => {
                    this.studentRequirements = res.payload;
                  },
                  (error: any) => {
                    console.error('Error fetching student requirements:', error);
                  }
                ));
            if (this.registrationStatus && !this.student.company_id)
              this.subscriptions.add(
                this.service.getHiringRequests(userId).subscribe(
                  (res: any) => {
                    this.hiringRequests = res.payload;
                  }
                ));
            if (this.registrationStatus && this.student.company_id)
            console.log(userId);
              this.subscriptions.add(
                this.service.getStudentJob(userId).subscribe((res: any) => {
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
    const userId = this.service.getCurrentUserId();
    const popup = this.dialog.open(ViewhiringrequestsComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: 'auto',
      data: {
        student_id: userId
      }
    });
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.loadData();
      })
    );
  }


}
