import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ChangeDetectionStrategy, inject } from '@angular/core';
import { Observable, Subscription, map } from 'rxjs';
import { SelectedClassService } from '../selected-class.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { JoinRequestsDialogComponent } from '../dialogs/join-requests-dialog/join-requests-dialog.component';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { AllStudentsDialogComponent } from '../dialogs/all-students-dialog/all-students-dialog.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { SentInvitesDialogComponent } from '../dialogs/sent-invites-dialog/sent-invites-dialog.component';
import { RouterLink } from '@angular/router';
import { PendingSubmissionsDialogComponent } from '../dialogs/pending-submissions-dialog/pending-submissions-dialog.component';
import { SessionService } from '../../../core/auth/session.service';
import { ClassService } from '../../../core/api/class.service';
import { ClassJoinService } from '../../../core/api/class-join.service';
import { ReportService } from '../../../core/api/report.service';
import { ClassProfile } from '../../../core/models/class';
import { ClassPendingSubmissions, StudentPendingSubmissions } from '../../../core/models/student';


@Component({
    selector: 'app-coordinator-dashboard',
    imports: [RouterLink, CommonModule, MatTooltipModule, ChartComponent],
    templateUrl: './coordinator-dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-dashboard.component.css'
})
export class CoordinatorDashboardComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly classApi = inject(ClassService);
  private readonly classJoinApi = inject(ClassJoinService);
  private readonly reportApi = inject(ReportService);
  userId: number;
  private subscriptions = new Subscription();
  blockData: ClassProfile | undefined;
  requestCount: any;
  invitationCount: any = 0;
  currentBlock: any;
  pendingSubmissions: StudentPendingSubmissions[] | undefined;
  pendingSubmissionsTotal: ClassPendingSubmissions | undefined;

  /* percentage data */
  registered: any;
  ojtsite: any;
  traininghours: any;
  seminarhours: any;
  perfeval: any;
  finalreports: any;
  completed: any;

  options: any;
  options2: any;

  constructor(private changeDetection: DataRefreshService, private dialog: MatDialog, @Inject(PLATFORM_ID) private platformId: Object, private blockService: SelectedClassService) {
    this.userId = this.session.requireUserId();

    this.options = {
      plugins: {
        aspectRatio: 2.5,
        legend: {
          labels: {
            usePointStyle: true,
            color: "#333",
          }
        }
      }

    };
    this.options2 = {
      plugins: {
        legend: {
          // position: 'left',
          labels: {
            usePointStyle: true,
            color: "#333",


          }
        }
      }

    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngOnInit(): void {
    this.subscriptions.add(
      this.blockService.selectedBlock$.pipe(
        map((res: any) => res)
      ).subscribe((res) => {
        this.currentBlock = res;
        this.loadClass(this.currentBlock);
        this.loadPendingSubmissionsTotal(this.currentBlock);
      })
    )

    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadClass(this.currentBlock);
          this.loadPendingSubmissionsTotal(this.currentBlock);
        }
      }
      )
    )
  }

  loadPendingSubmissions(block: any) {
    this.subscriptions.add(
      this.reportApi.pendingSubmissions(block).subscribe((res) => {
        this.pendingSubmissions = res.payload;
      })
    )
  }

  loadPendingSubmissionsTotal(block: any) {
    this.subscriptions.add(
      this.reportApi.pendingSubmissionTotals(block).subscribe((res) => {
        console.log(res);
        this.pendingSubmissionsTotal = res.payload[0];
      })
    )
  }

  loadClass(block: any) {
    this.subscriptions.add(
      this.classApi.profile(block).subscribe((res) => {
        this.blockData = res.payload[0];
        this.processChartData(res.payload);
        if (this.blockData) {
          this.getRequestsCount(this.blockData.block_name);
          this.getInvitationCount(this.blockData.block_name);
        }
      }))
  }

  processChartData(payload: any[]) {
    // Calculate the percentage of ojt_cleared_students
    const registrationperc = payload.map(block => {

      const clearedStudents = block.registered_students || 0// Handle cases where ojt_cleared_students might be null or undefined
      const totalStudents = block.students_handled || 1// Ensure no division by zero, handle undefined or null values

      // Calculate percentage based on actual numbers
      return (clearedStudents / totalStudents) * 100;
    });

    const ojtsitesperc = payload.map(block => {

      const clearedStudents = block.hired_students || 0
      const totalStudents = block.students_handled || 1

      return (clearedStudents / totalStudents) * 100;
    });

    const hoursperc = payload.map(block => {

      const clearedStudents = block.ojt_cleared_students || 0
      const totalStudents = block.students_handled || 1

      return (clearedStudents / totalStudents) * 100;
    });
    const seminarhoursperc = payload.map(block => {

      const clearedStudents = block.seminar_cleared_students || 0
      const totalStudents = block.students_handled || 1

      return (clearedStudents / totalStudents) * 100;
    });

    const perfeval = payload.map(block => {

      const clearedStudents = block.evaluation_cleared_students || 0
      const totalStudents = block.students_handled || 1

      return (clearedStudents / totalStudents) * 100;
    });

    const frpeval = payload.map(block => {

      const clearedStudents = block.exitpoll_cleared_students || 0
      const totalStudents = block.students_handled || 1

      return (clearedStudents / totalStudents) * 100;
    });

    const compeval = payload.map(block => {

      const clearedStudents = block.practicum_completed_students || 0
      const totalStudents = block.students_handled || 1

      return (clearedStudents / totalStudents) * 100;
    });

    // Calculate the remaining percentage
    const remainingPercentages = registrationperc.map(percent => 100 - percent);

    const labels = ["Cleared", "Not Cleared"]
    const backgroundColor = ["#fc5c1c", "#1e3a8a"]

    this.registered = {
      labels: labels,
      datasets: [
        {
          data: [registrationperc, remainingPercentages],
          backgroundColor: backgroundColor
        },
      ],
    };

    const remainingperc = ojtsitesperc.map(percent => 100 - percent);
    this.ojtsite = {
      labels: labels,
      datasets: [
        {
          data: [ojtsitesperc, remainingperc],
          backgroundColor: backgroundColor
        },
      ],
    };

    const remaining = hoursperc.map(percent => 100 - percent);
    this.traininghours = {
      labels: labels,
      datasets: [
        {
          data: [hoursperc, remaining],
          backgroundColor: backgroundColor
        },
      ],
    };

    const remain = seminarhoursperc.map(percent => 100 - percent);
    this.seminarhours = {
      labels: labels,
      datasets: [
        {
          data: [seminarhoursperc, remain],
          backgroundColor: backgroundColor
        },
      ],
    };

    const remainingP = perfeval.map(percent => 100 - percent);
    this.perfeval = {
      labels: labels,
      datasets: [
        {
          data: [perfeval, remainingP],
          backgroundColor: backgroundColor
        },
      ],
    };

    const remainingfrp = frpeval.map(percent => 100 - percent);
    this.finalreports = {
      labels: labels,
      datasets: [
        {
          data: [frpeval, remainingfrp],
          backgroundColor: backgroundColor
        },
      ],
    };

    const remainingcom = compeval.map(percent => 100 - percent);
    this.completed = {
      labels: labels,
      datasets: [
        {
          data: [compeval, remainingcom],
          backgroundColor: backgroundColor
        },
      ],
    };

  }



  getRequestsCount(block: any) {
    this.subscriptions.add(
      this.classJoinApi.requestCountForClass(block).pipe(
        map((res: any) => res.payload[0].requestCount)
      ).subscribe((count: any) => {
        this.requestCount = count;
      }));
  }
  getInvitationCount(block: any) {
    this.subscriptions.add(
      this.classJoinApi.invitationCountForClass(block).pipe(
        map((res: any) => res.payload[0].invitationCount)
      ).subscribe((count: any) => {
        this.invitationCount = count;
      }));
  }

  viewAllStudents(block: any,) {
    const popup = this.dialog.open(AllStudentsDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        block: block
      }
    })
  }

  viewStudentsWithCondition(block: any, condition: string) {
    const popup = this.dialog.open(AllStudentsDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        block: block,
        condition: condition
      }
    })
  }

  viewStudentsWithPendingSubmissions(block: any, condition: string) {
    const popup = this.dialog.open(PendingSubmissionsDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        block: block,
        condition: condition
      }
    })
  }





  viewJoinRequests(block: any) {
    const popup = this.dialog.open(JoinRequestsDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        block: block
      }
    })
  }

  viewSentInvites(block: any) {
    const popup = this.dialog.open(SentInvitesDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        block: block
      }
    })
  }

}
