import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { EvaluationFormDialogComponent } from '../dialogs/evaluation-form-dialog/evaluation-form-dialog.component';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { CompanyService } from '../../../core/api/company.service';
import { MediaService } from '../../../core/api/media.service';
import { Supervisor } from '../../../core/models/company';

@Component({
    selector: 'app-supervisor-evaluations',
    imports: [CommonModule, FormsModule, FilterPipe],
    templateUrl: './supervisor-evaluations.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './supervisor-evaluations.component.css'
})
export class SupervisorEvaluationsComponent implements OnInit, OnDestroy {
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

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.session.requireUserId();
    this.subscriptions.add(
      this.companyApi.supervisor(this.userId).subscribe((res) => {
        this.user = res.payload[0];
      })
    );
  }


  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.studentApi.ofSupervisor(this.userId).subscribe((res) => {
        this.traineesList = res.payload.map((student) => {
          return { ...student, avatar: '' };
        });
        this.traineesList = this.traineesList.filter((student) => student.TotalHoursWorked >= 200);
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

  viewTemplate() {
    const pdfPath = '../../assets/pdfTemplates/Evaluation.pdf';
    window.open(pdfPath, '_blank');
  }

  viewEvaluation(student: any) {
    const popup = this.dialog.open(EvaluationFormDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        student: student
      }
    });

  }
}
