import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Observable, Subscription, map } from 'rxjs';
import { BlockService } from '../../../services/block.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ViewJoinRequestsComponent } from '../../popups/popups-coordinator/view-join-requests/view-join-requests.component';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';
import { ViewAllStudentsComponent } from '../../popups/popups-coordinator/view-all-students/view-all-students.component';
import { ChartModule } from 'primeng/chart';
import { ViewSentInvitesComponent } from '../../popups/popups-coordinator/view-sent-invites/view-sent-invites.component';
import { RouterLink } from '@angular/router';
import { ViewStudentsPendingsubmissionsComponent } from '../../popups/popups-coordinator/view-students-pendingsubmissions/view-students-pendingsubmissions.component';


@Component({
  selector: 'app-coord-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, MatTooltipModule, ChartModule],
  templateUrl: './coord-dashboard.component.html',
  styleUrl: './coord-dashboard.component.css'
})
export class CoordDashboardComponent implements OnInit, OnDestroy {
  userId: any;
  private subscriptions = new Subscription();
  blockData: any;
  requestCount: any;
  invitationCount: any = 0;
  currentBlock: any;
  pendingSubmissions: any;
  pendingSubmissionsTotal: any;

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

  constructor(private changeDetection: ChangeDetectionService, private dialog: MatDialog, @Inject(PLATFORM_ID) private platformId: Object, private service: AuthService, private blockService: BlockService) {
    this.userId = this.service.getCurrentUserId();

    this.options = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: "#333"
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
      ).subscribe((res: any) => {
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
      this.service.getPendingSubmissions(block).subscribe((res: any) => {
        this.pendingSubmissions = res.payload;
      })
    )
  }

  loadPendingSubmissionsTotal(block: any) {
    this.subscriptions.add(
      this.service.getPendingSubmissionsTotal(block).subscribe((res: any) => {
        console.log(res);
        this.pendingSubmissionsTotal = res.payload[0];
      })
    )
  }

  loadClass(block: any) {
    this.subscriptions.add(
      this.service.getClassData(block).subscribe((res: any) => {
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
      this.service.getClassJoinRequestCount(block).pipe(
        map((res: any) => res.payload[0].requestCount)
      ).subscribe((count: any) => {
        this.requestCount = count;
      }));
  }
  getInvitationCount(block: any) {
    this.subscriptions.add(
      this.service.getClassInvitationForBlockCount(block).pipe(
        map((res: any) => res.payload[0].invitationCount)
      ).subscribe((count: any) => {
        this.invitationCount = count;
      }));
  }

  viewAllStudents(block: any,) {
    const popup = this.dialog.open(ViewAllStudentsComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        block: block
      }
    })
  }

  viewStudentsWithCondition(block: any, condition: string) {
    const popup = this.dialog.open(ViewAllStudentsComponent, {
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
    const popup = this.dialog.open(ViewStudentsPendingsubmissionsComponent, {
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
    const popup = this.dialog.open(ViewJoinRequestsComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        block: block
      }
    })
  }

  viewSentInvites(block: any) {
    const popup = this.dialog.open(ViewSentInvitesComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        block: block
      }
    })
  }

}
