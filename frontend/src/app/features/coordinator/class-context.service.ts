import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ClassService } from '../../core/api/class.service';
import { ReportService } from '../../core/api/report.service';
import { ClassProfile } from '../../core/models/class';
import { ClassPendingSubmissions, StudentPendingSubmissions } from '../../core/models/student';

/** What a coordinator reviews, with the matching pending-count column and student tab. */
export const REVIEW_KINDS = [
  { key: 'pending_req_count', label: 'Requirements', tab: 'requirements' },
  { key: 'pending_war_count_advisor', label: 'Weekly reports', tab: 'weekly-reports' },
  { key: 'pending_doc_count', label: 'Documentation', tab: 'documentation' },
  { key: 'pending_sem_count', label: 'Seminars', tab: 'seminars' },
  { key: 'pending_sse_count', label: 'Evaluations', tab: 'evaluation' },
  { key: 'pending_frp_count', label: 'Final reports', tab: 'final-report' },
] as const;

export type ReviewKind = (typeof REVIEW_KINDS)[number]['key'];

/**
 * The class being worked on, taken from the URL (/coordinator/classes/:block/...),
 * with its numbers. Provided by the class layout, so each class gets a fresh one.
 */
@Injectable()
export class ClassContextService {
  private readonly classApi = inject(ClassService);
  private readonly reportApi = inject(ReportService);

  readonly block = toSignal(inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('block') ?? '')), {
    requireSync: true,
  });

  private readonly profileState = signal<ClassProfile | null>(null);
  private readonly totalsState = signal<ClassPendingSubmissions | null>(null);
  private readonly perStudentState = signal<StudentPendingSubmissions[]>([]);

  readonly profile = this.profileState.asReadonly();
  readonly pendingTotals = this.totalsState.asReadonly();
  /** Pending counts per student, keyed by student id. */
  readonly pendingByStudent = computed(() => new Map(this.perStudentState().map((row) => [row.student_id, row])));
  readonly pendingTotal = computed(() => {
    const totals = this.totalsState();
    return totals ? REVIEW_KINDS.reduce((sum, kind) => sum + Number(totals[kind.key] ?? 0), 0) : 0;
  });

  constructor() {
    // Reload whenever the class in the URL changes.
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed()).subscribe(() => this.refresh());
  }

  /** Reloads the class's numbers, e.g. after something was approved. */
  refresh(): void {
    const block = this.block();
    if (!block) {
      return;
    }
    this.classApi.profile(block).subscribe((res) => this.profileState.set(res.payload[0] ?? null));
    this.reportApi.pendingSubmissionTotals(block).subscribe((res) => this.totalsState.set(res.payload[0] ?? null));
    this.reportApi.pendingSubmissions(block).subscribe((res) => this.perStudentState.set(res.payload));
  }

  pendingFor(studentId: number): number {
    const row = this.pendingByStudent().get(studentId);
    return row ? REVIEW_KINDS.reduce((sum, kind) => sum + Number(row[kind.key] ?? 0), 0) : 0;
  }
}
