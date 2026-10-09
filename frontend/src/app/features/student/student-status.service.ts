import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SessionService } from '../../core/auth/session.service';
import { StudentService } from '../../core/api/student.service';
import { DataRefreshService } from '../../core/data-refresh.service';
import { StudentOjtStatus } from '../../core/models/student';

/** Hours a student must render, and seminar hours they must attend, to finish the practicum. */
export const REQUIRED_TRAINING_HOURS = 200;
export const REQUIRED_SEMINAR_HOURS = 50;

/**
 * The signed-in student's practicum progress, shared by the student layout and
 * its pages. Provided by the student layout component, so it is created anew
 * for every sign-in and discarded on sign-out. Reloads whenever
 * DataRefreshService announces a change.
 */
@Injectable()
export class StudentStatusService {
  private readonly studentApi = inject(StudentService);
  readonly studentId = inject(SessionService).requireUserId();

  private readonly state = signal<StudentOjtStatus | null>(null);
  private readonly loadedOnce = signal(false);

  readonly student = this.state.asReadonly();
  readonly loaded = this.loadedOnce.asReadonly();

  readonly hasClass = computed(() => !!this.state()?.block);
  readonly isRegistered = computed(() => this.state()?.registration_status === 1);
  readonly isPlaced = computed(() => !!this.state()?.company_id);
  /** Hours arrive as DECIMAL strings, e.g. "250.00", or null before any are approved. */
  readonly trainingHours = computed(() => Number(this.state()?.TotalHoursWorked ?? 0));
  readonly seminarHours = computed(() => Number(this.state()?.TotalSeminarHours ?? 0));
  readonly evaluationDone = computed(() => this.state()?.evaluation_status === 'Completed!');
  readonly finalReportDone = computed(() => this.state()?.exitpoll_status === 'Completed!');
  readonly isClockedIn = computed(() => this.state()?.clock_status === 'Clocked In');

  readonly isComplete = computed(() =>
    this.trainingHours() >= REQUIRED_TRAINING_HOURS &&
    this.seminarHours() >= REQUIRED_SEMINAR_HOURS &&
    this.evaluationDone() &&
    this.finalReportDone(),
  );

  constructor() {
    this.refresh();
    inject(DataRefreshService).changeDetected$
      .pipe(filter(Boolean), takeUntilDestroyed())
      .subscribe(() => this.refresh());
  }

  refresh(): void {
    this.studentApi.ojtStatus(this.studentId).subscribe({
      next: (res) => {
        this.state.set(res.payload[0] ?? null);
        this.loadedOnce.set(true);
      },
      error: () => this.loadedOnce.set(true),
    });
  }
}
