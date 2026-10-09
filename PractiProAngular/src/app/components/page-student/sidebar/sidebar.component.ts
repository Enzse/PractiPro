import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';
import { SessionService } from '../../../services/session.service';
import { StudentService } from '../../../services/api/student.service';
import { SidebarService } from '../../../services/sidebar.service';
import { StudentOjtStatus } from '../../../models/student';

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, MatTooltipModule],
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  protected readonly sidebarState = inject(SidebarService);
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  studentId: number;
  student: StudentOjtStatus | undefined;

  /** Hours arrive as a DECIMAL string, e.g. "250.00". */
  get hoursWorked(): number {
    return Number(this.student?.TotalHoursWorked ?? 0);
  }
  company_id: number | null | undefined;
  registrationStatus: number | null | undefined;
  class: string | null | undefined;
  private subscriptions = new Subscription();

  constructor(
    private changeDetection: ChangeDetectionService
  ) {
    this.studentId = this.session.requireUserId();
  }

  ngOnInit(): void {
    this.loadData();


    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadData();
        }
      })
    )
  }

  loadData() {
    this.subscriptions.add(
      this.studentApi.ojtStatus(this.studentId).subscribe((res) => {
          this.student = res.payload[0];
          this.registrationStatus = res.payload[0].registration_status;
          this.company_id = res.payload[0].company_id;
          this.class = res.payload[0].block;
        },
        (error: any) => {
          console.error('Error fetching student requirements:', error);
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
