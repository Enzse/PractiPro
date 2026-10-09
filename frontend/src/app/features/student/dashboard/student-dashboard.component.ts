import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { StudentService } from '../../../core/api/student.service';
import { CompanyService } from '../../../core/api/company.service';
import { StudentRequirements } from '../../../core/models/student';
import { HiringRequest, Job, Schedule } from '../../../core/models/company';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { TimePipe } from '../../../shared/pipes/time.pipe';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ProgressRingComponent } from '../../../shared/ui/progress-ring/progress-ring.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { HiringRequestsDialogComponent } from '../dialogs/hiring-requests-dialog/hiring-requests-dialog.component';
import { REQUIREMENT_TYPES } from '../../../shared/practicum/requirement-types';
import { REQUIRED_SEMINAR_HOURS, REQUIRED_TRAINING_HOURS, StudentStatusService } from '../student-status.service';

interface Step {
  label: string;
  detail: string;
  done: boolean;
  link?: string;
  action?: string;
}

@Component({
  selector: 'app-student-dashboard',
  imports: [DatePipe, DecimalPipe, RouterLink, TimePipe, PageHeaderComponent, IconComponent, ProgressRingComponent, EmptyStateComponent],
  templateUrl: './student-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent implements OnInit {
  protected readonly status = inject(StudentStatusService);
  private readonly studentApi = inject(StudentService);
  private readonly companyApi = inject(CompanyService);
  private readonly dialog = inject(MatDialog);
  private readonly refresh = inject(DataRefreshService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly requiredTraining = REQUIRED_TRAINING_HOURS;
  protected readonly requiredSeminar = REQUIRED_SEMINAR_HOURS;
  protected readonly today = new Date();
  protected readonly greeting = greetingFor(this.today);

  protected readonly requirements = signal<StudentRequirements | null>(null);
  protected readonly hiringRequests = signal<HiringRequest[]>([]);
  protected readonly job = signal<Job | null>(null);
  protected readonly schedules = signal<Schedule[]>([]);

  protected readonly requirementRows = computed(() => {
    const approved = this.requirements();
    return REQUIREMENT_TYPES.map((type) => ({ label: type.label, approved: !!approved?.[type.field] }));
  });
  protected readonly approvedCount = computed(() => this.requirementRows().filter((row) => row.approved).length);
  protected readonly workDays = computed(() => this.schedules().filter((day) => isWorkDay(day)).length);

  protected readonly steps = computed<Step[]>(() => {
    const s = this.status;
    const student = s.student();
    const training = s.trainingHours();
    const seminar = s.seminarHours();
    return [
      { label: 'Join a class', done: s.hasClass(), detail: student?.block ?? 'Accept an invitation or send a request', link: '/student/join-classes', action: 'Find a class' },
      {
        label: 'Get your requirements approved',
        done: s.isRegistered(),
        detail: `${this.approvedCount()} of ${REQUIREMENT_TYPES.length} approved`,
        link: '/student/requirements',
        action: 'Upload requirements',
      },
      { label: 'Get placed at a company', done: s.isPlaced(), detail: student?.company_name ?? 'Companies invite you through PractiPro' },
      {
        label: `Render ${REQUIRED_TRAINING_HOURS} training hours`,
        done: training >= REQUIRED_TRAINING_HOURS,
        detail: `${formatHours(training)} of ${REQUIRED_TRAINING_HOURS} hours approved`,
        link: '/student/dtr',
        action: 'Open attendance',
      },
      {
        label: `Attend ${REQUIRED_SEMINAR_HOURS} seminar hours`,
        done: seminar >= REQUIRED_SEMINAR_HOURS,
        detail: `${formatHours(seminar)} of ${REQUIRED_SEMINAR_HOURS} hours approved`,
        link: '/student/seminars',
        action: 'Add a seminar',
      },
      { label: 'Performance evaluation', done: s.evaluationDone(), detail: s.evaluationDone() ? 'Approved' : 'Filled in by your supervisor' },
      {
        label: 'Submit your final report',
        done: s.finalReportDone(),
        detail: s.finalReportDone()
          ? 'Approved'
          : training >= REQUIRED_TRAINING_HOURS
            ? 'A short questionnaire about your experience'
            : `Opens at ${REQUIRED_TRAINING_HOURS} training hours`,
        link: training >= REQUIRED_TRAINING_HOURS ? '/student/final-report' : undefined,
        action: 'Write final report',
      },
    ];
  });
  protected readonly currentStep = computed(() => this.steps().findIndex((step) => !step.done));
  protected readonly stepsDone = computed(() => this.steps().filter((step) => step.done).length);

  ngOnInit(): void {
    this.load();
    // A dialog (e.g. accepting a company's invitation) changed something.
    this.refresh.changeDetected$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((changed) => changed && this.load());
  }

  private load(): void {
    const id = this.status.studentId;
    this.studentApi.requirements(id).subscribe((res) => this.requirements.set(res.payload[0] ?? null));
    this.companyApi.hiringRequestsOf(id).subscribe((res) => this.hiringRequests.set(res.payload));
    this.companyApi.jobOf(id).subscribe((res) => this.job.set(res.payload[0] ?? null));
    this.companyApi.schedulesOf(id).subscribe((res) => this.schedules.set(res.payload));
  }

  protected isWorkDay(day: Schedule): boolean {
    return isWorkDay(day);
  }

  protected openInvitations(): void {
    this.dialog
      .open(HiringRequestsDialogComponent, { data: { student_id: this.status.studentId }, panelClass: 'app-dialog', width: '560px' })
      .afterClosed()
      .subscribe(() => {
        this.status.refresh();
        this.load();
      });
  }
}

function isWorkDay(day: Schedule): boolean {
  return !!Number(day.has_work) && !(day.start_time === '00:00:00' && day.end_time === '00:00:00');
}

/** 268.02 -> "268", 12.5 -> "12.5". */
function formatHours(hours: number): string {
  return String(Math.round(hours * 10) / 10);
}

function greetingFor(date: Date): string {
  const hour = date.getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}
