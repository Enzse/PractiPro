import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';
import { SessionService } from '../../../services/session.service';
import { StudentService } from '../../../services/api/student.service';
import { SidebarService } from '../../../services/sidebar.service';

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
  studentId: any;
  student: any;
  company_id: any;
  registrationStatus: any;
  class: any;
  private subscriptions = new Subscription();

  constructor(
    private changeDetection: ChangeDetectionService
  ) {
    this.studentId = this.session.userId();
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
