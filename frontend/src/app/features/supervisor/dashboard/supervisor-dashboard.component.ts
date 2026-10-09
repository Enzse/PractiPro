import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { SelectTraineesDialogComponent } from '../dialogs/select-trainees-dialog/select-trainees-dialog.component';
import { TraineeDialogComponent } from '../dialogs/trainee-dialog/trainee-dialog.component';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { Subscription } from 'rxjs';
import { DataRefreshService } from '../../../core/data-refresh.service';
import Swal from 'sweetalert2';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { CompanyService } from '../../../core/api/company.service';
import { MediaService } from '../../../core/api/media.service';
import { Supervisor } from '../../../core/models/company';

@Component({
    selector: 'app-supervisor-dashboard',
    imports: [CommonModule, DatePipe, FormsModule, FilterPipe],
    templateUrl: './supervisor-dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./supervisor-dashboard.component.css']
})
export class SupervisorDashboardComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly companyApi = inject(CompanyService);
  private readonly mediaApi = inject(MediaService);
  userId: number;
  user: Supervisor | undefined;
  traineesList: any[] = [];
  avatarUrl?: SafeUrl;
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer, private changeDetection: DataRefreshService) {
    this.userId = this.session.requireUserId();
    this.subscriptions.add(
      this.companyApi.supervisor(this.userId).subscribe((res) => {
        this.user = res.payload[0];
      })
    );
  }

  ngOnInit(): void {
    this.loadData();

    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadData();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    console.log("Loading Data...");
    this.subscriptions.add(
      this.studentApi.ofSupervisor(this.userId).subscribe((res) => {
        this.traineesList = res.payload.map((user) => {
          return { ...user, avatar: '' };
        });
        this.traineesList.forEach((student) => {
          this.subscriptions.add(
            this.mediaApi.avatar(student.id).subscribe((res) => {
              if (res.size > 0) {
                const url = URL.createObjectURL(res);
                student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
              }
            })
          );
        });
      })
    );
  }

  selectTrainees() {
    const popup = this.dialog.open(SelectTraineesDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        company_id: this.user?.company_id,
        supervisor_id: this.userId
      }
    });
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        const changeDetected = res;
        if (changeDetected) {
          console.log("Change detected!");
          this.loadData();
        }
      })
    );
  }

  viewTrainee(student: any) {
    const popup = this.dialog.open(TraineeDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        student: student
      }
    });
  }

  removeStudentFromSelection(id: number, firstName: string) {
    this.companyApi.unassignFromSupervisor(id, this.userId).subscribe((res) => {
      this.loadData();
      Swal.fire({
        toast: true,
        position: "top-end",
        title: `Removed ${firstName} from your supervision.`,
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        showCloseButton: true,
      });
    })
  }
}
