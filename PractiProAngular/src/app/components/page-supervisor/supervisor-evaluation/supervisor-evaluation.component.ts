import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { SpvEvaluationpopupComponent } from '../../popups/popups-supervisor/spv-evaluationpopup/spv-evaluationpopup.component';
import { SessionService } from '../../../services/session.service';
import { StudentService } from '../../../services/api/student.service';
import { CompanyService } from '../../../services/api/company.service';
import { MediaService } from '../../../services/api/media.service';

@Component({
    selector: 'app-supervisor-evaluation',
    imports: [CommonModule, FormsModule, FilterPipe],
    templateUrl: './supervisor-evaluation.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './supervisor-evaluation.component.css'
})
export class SupervisorEvaluationComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly companyApi = inject(CompanyService);
  private readonly mediaApi = inject(MediaService);
  userId: any;
  user: any;
  traineesList: any[] = [];
  avatarUrl?: SafeUrl;
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.session.userId();
    this.subscriptions.add(
      this.companyApi.supervisor(this.userId).subscribe((res: any) => {
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
      this.studentApi.ofSupervisor(this.userId).subscribe((res: any) => {
        this.traineesList = res.payload.map((student: any) => {
          return { ...student, avatar: '' };
        });
        this.traineesList = this.traineesList.filter((student: any) => student.TotalHoursWorked >= 200);
        this.traineesList.forEach((student: any) => {
          this.subscriptions.add(
            this.mediaApi.avatar(student.id).subscribe((res: any) => {
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
    const popup = this.dialog.open(SpvEvaluationpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        student: student
      }
    });

  }
}
