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
        this.processOjtData(res.payload);
        this.processtraininghours(res.payload);
        this.processSeminarHours(res.payload);
        this.processPerfEval(res.payload);
        if (this.blockData) {
          this.getRequestsCount(this.blockData.block_name);
          this.getInvitationCount(this.blockData.block_name);
        }
      }))
  }

  processChartData(payload: any[]) {
    // Initialize variables to store totals
    let totalClearedStudents = 0;
    let totalNotClearedStudents = 0;

    // Iterate through the payload to accumulate totals
    payload.forEach(block => {
      totalClearedStudents += block.registered_students || 0;
      totalNotClearedStudents += (block.students_handled || 0) - (block.registered_students || 0);
    });

    // Prepare data for the chart
    this.data = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [totalClearedStudents, totalNotClearedStudents],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
        }
      ]
    };
  }

  processOjtData(payload: any[]) {
    // Initialize variables to store totals
    let totalClearedStudents = 0;
    let totalNotClearedStudents = 0;

    // Iterate through the payload to accumulate totals
    payload.forEach(block => {
      totalClearedStudents += block.hired_students || 0;
      totalNotClearedStudents += (block.students_handled || 0) - (block.hired_students || 0);
    });

    // Prepare data for the chart
    this.ojtsite = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [totalClearedStudents, totalNotClearedStudents],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
        }
      ]
    };
  }

  processtraininghours(payload: any[]) {
    // Initialize variables to store totals
    let totalClearedStudents = 0;
    let totalNotClearedStudents = 0;

    // Iterate through the payload to accumulate totals
    payload.forEach(block => {
      totalClearedStudents += block.ojt_cleared_students || 0;
      totalNotClearedStudents += (block.students_handled || 0) - (block.ojt_cleared_students || 0);
    });

    // Prepare data for the chart
    this.traininghours = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [totalClearedStudents, totalNotClearedStudents],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
        }
      ]
    };
  }

  processSeminarHours(payload: any[]) {
    // Initialize variables to store totals
    let totalClearedStudents = 0;
    let totalNotClearedStudents = 0;

    // Iterate through the payload to accumulate totals
    payload.forEach(block => {
      totalClearedStudents += block.seminar_cleared_students || 0;
      totalNotClearedStudents += (block.students_handled || 0) - (block.seminar_cleared_students || 0);
    });

    // Prepare data for the chart
    this.seminarhours = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [totalClearedStudents, totalNotClearedStudents],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
        }
      ]
    };
  }

  processPerfEval(payload: any[]) {
    // Initialize variables to store totals
    let totalClearedStudents = 0;
    let totalNotClearedStudents = 0;

    // Iterate through the payload to accumulate totals
    payload.forEach(block => {
      totalClearedStudents += block.evaluation_cleared_students || 0;
      totalNotClearedStudents += (block.students_handled || 0) - (block.evaluation_cleared_students || 0);
    });

    // Prepare data for the chart
    this.perfeval = {
      labels: ["Cleared", "Not Cleared"],
      datasets: [
        {
          data: [totalClearedStudents, totalNotClearedStudents],
          backgroundColor: ["#FFBD2E", "#1e3a8a"]
        }
      ]
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
