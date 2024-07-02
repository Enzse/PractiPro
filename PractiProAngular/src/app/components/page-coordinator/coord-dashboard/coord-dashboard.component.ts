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

@Component({
  selector: 'app-coord-dashboard',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './coord-dashboard.component.html',
  styleUrl: './coord-dashboard.component.css'
})
export class CoordDashboardComponent implements OnInit, OnDestroy {
  userId: any;
  private subscriptions = new Subscription();
  blockData: any;
  requestCount: any;
  currentBlock: any;

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
        this.loadClass(this.currentBlock);
      })
    )

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
        if (this.blockData) {
          this.getRequestsCount(this.blockData.block_name);
        }
      }))
  }

  getRequestsCount(block: any) {
    this.subscriptions.add(
      this.service.getClassJoinRequestCount(block).pipe(
        map((res: any) => res.payload[0].requestCount)
      ).subscribe((count: any) => {
        this.requestCount = count;
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

}
