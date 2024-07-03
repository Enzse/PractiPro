import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Observable, Subscription, map } from 'rxjs';
import { initFlowbite } from 'flowbite';
import { BlockService } from '../../../services/block.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ViewJoinRequestsComponent } from '../../popups/popups-coordinator/view-join-requests/view-join-requests.component';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';
import { ViewAllStudentsComponent } from '../../popups/popups-coordinator/view-all-students/view-all-students.component';
import { ChartModule } from 'primeng/chart';
import { ViewSentInvitesComponent } from '../../popups/popups-coordinator/view-sent-invites/view-sent-invites.component';


@Component({
  selector: 'app-coord-dashboard',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, ChartModule],
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

  /* percentage data */
  data: any;
  ojtsite: any;
  traininghours: any;
  seminarhours: any;
  perfeval: any;
  finalreports: any;

  options: any;


  constructor(private changeDetection: ChangeDetectionService, private dialog: MatDialog, @Inject(PLATFORM_ID) private platformId: Object, private service: AuthService, private blockService: BlockService) {
    this.userId = this.service.getCurrentUserId();


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
        console.log(this.currentBlock);
        this.loadClass(this.currentBlock);
      })
    )

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

    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadClass(this.currentBlock);
        }
      }
      )
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

    // Calculate the remaining percentage
    const remainingPercentages = registrationperc.map(percent => 100 - percent);

    this.data = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [registrationperc, remainingPercentages],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
        },
      ],
    };

    const remainingperc = ojtsitesperc.map(percent => 100 - percent);
    this.ojtsite = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [ojtsitesperc, remainingperc],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
        },
      ],
    };

    const remaining = hoursperc.map(percent => 100 - percent);
    this.traininghours = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [hoursperc, remaining],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
        },
      ],
    };

    const remain = seminarhoursperc.map(percent => 100 - percent);
    this.seminarhours = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [seminarhoursperc, remain],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
        },
      ],
    };

    const remainingP = perfeval.map(percent => 100 - percent);
    this.perfeval = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [perfeval, remainingP],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
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
        console.log(count);
        this.invitationCount = count;
        console.log(this.invitationCount);
      }));
  }


  viewAllStudents(block: any) {
    const popup = this.dialog.open(ViewAllStudentsComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        block: block
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
