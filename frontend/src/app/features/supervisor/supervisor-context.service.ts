import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { SessionService } from '../../core/auth/session.service';
import { CompanyService } from '../../core/api/company.service';
import { ReportService } from '../../core/api/report.service';
import { StudentService } from '../../core/api/student.service';
import { Supervisor } from '../../core/models/company';
import { StudentOjtStatus, StudentPendingSubmissions } from '../../core/models/student';

/** Hours a trainee must render before the supervisor evaluates them. */
export const EVALUATION_HOURS = 200;

export interface TraineeWork {
  /** Daily time records waiting for the supervisor. */
  days: number;
  /** Weekly reports waiting for the supervisor. */
  reports: number;
  /** Has rendered enough hours to be evaluated, and hasn't been yet. */
  evaluationDue: boolean;
}

/**
 * The signed-in supervisor, their trainees and what each trainee has waiting.
 * Provided by the supervisor layout: created at sign-in, discarded at sign-out.
 */
@Injectable()
export class SupervisorContextService {
  private readonly companyApi = inject(CompanyService);
  private readonly studentApi = inject(StudentService);
  private readonly reportApi = inject(ReportService);
  readonly supervisorId = inject(SessionService).requireUserId();

  private readonly profileState = signal<Supervisor | null>(null);
  private readonly traineeState = signal<StudentOjtStatus[] | null>(null);
  private readonly workState = signal<Map<number, TraineeWork>>(new Map());

  readonly profile = this.profileState.asReadonly();
  /** null until loaded. */
  readonly trainees = this.traineeState.asReadonly();
  readonly work = this.workState.asReadonly();

  readonly totals = computed(() => {
    let days = 0;
    let reports = 0;
    let evaluations = 0;
    for (const item of this.workState().values()) {
      days += item.days;
      reports += item.reports;
      evaluations += item.evaluationDue ? 1 : 0;
    }
    return { days, reports, evaluations, all: days + reports + evaluations };
  });

  constructor() {
    this.companyApi.supervisor(this.supervisorId).subscribe((res) => this.profileState.set(res.payload[0] ?? null));
    this.refresh();
  }

  workFor(studentId: number): TraineeWork {
    return this.workState().get(studentId) ?? { days: 0, reports: 0, evaluationDue: false };
  }

  pendingFor(studentId: number): number {
    const work = this.workFor(studentId);
    return work.days + work.reports + (work.evaluationDue ? 1 : 0);
  }

  /** Reloads the trainees and their pending work, e.g. after an approval. */
  refresh(): void {
    this.studentApi.ofSupervisor(this.supervisorId).subscribe({
      next: (res) => {
        const trainees = res.payload;
        this.traineeState.set(trainees);
        if (trainees.length === 0) {
          this.workState.set(new Map());
          return;
        }
        forkJoin(trainees.map((trainee) => this.loadWork(trainee))).subscribe((entries) => this.workState.set(new Map(entries)));
      },
      error: () => this.traineeState.set([]),
    });
  }

  private loadWork(trainee: StudentOjtStatus) {
    const pending$ = this.studentApi.pendingSubmissions(trainee.id).pipe(
      map((res): Partial<StudentPendingSubmissions> => res.payload[0] ?? {}),
      catchError(() => of<Partial<StudentPendingSubmissions>>({})),
    );
    const eligible = Number(trainee.TotalHoursWorked ?? 0) >= EVALUATION_HOURS;
    const evaluated$ = eligible
      ? this.reportApi.evaluationOf(trainee.id).pipe(
          map((res) => res.payload.length > 0),
          catchError(() => of(true)),
        )
      : of(true);
    return forkJoin([pending$, evaluated$]).pipe(
      map(([pending, evaluated]): [number, TraineeWork] => [
        trainee.id,
        {
          days: Number(pending.pending_dtr_count ?? 0),
          reports: Number(pending.pending_war_count_supervisor ?? 0),
          evaluationDue: eligible && !evaluated,
        },
      ]),
    );
  }
}
