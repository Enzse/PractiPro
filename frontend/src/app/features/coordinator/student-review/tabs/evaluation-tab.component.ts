import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReportService } from '../../../../core/api/report.service';
import { SubmissionService } from '../../../../core/api/submission.service';
import { PerformanceEvaluation } from '../../../../core/models/records';
import { EvaluationAnswersComponent } from '../../../../shared/practicum/evaluation-answers.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ReviewActionsComponent } from '../../../../shared/ui/review-actions/review-actions.component';
import { StudentReviewContextService } from '../student-review-context.service';

/** The supervisor's performance evaluation of the student, for the coordinator to approve. */
@Component({
  selector: 'app-evaluation-tab',
  imports: [DatePipe, EmptyStateComponent, ReviewActionsComponent, EvaluationAnswersComponent],
  template: `
    @if (loading()) {
      <div class="skeleton h-64 rounded-2xl"></div>
    } @else if (evaluation(); as ev) {
      <section class="card overflow-hidden">
        <header class="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 class="section-title">Performance evaluation</h2>
            <p class="text-sm text-slate-500">Filled in by the supervisor on {{ ev.created_at | date: 'MMMM d, y' }}. Ratings are from 1 (lowest) to 5 (highest).</p>
          </div>
          <app-review-actions [status]="ev.advisor_approval" [busy]="busy()" (decide)="decide(ev, $event)" />
        </header>
        <app-evaluation-answers [evaluation]="ev" />
      </section>
    } @else {
      <section class="card">
        <app-empty-state icon="seal-check:duotone" title="Not evaluated yet"
          description="The student’s supervisor fills in the performance evaluation near the end of the practicum." />
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationTabComponent {
  private readonly review = inject(StudentReviewContextService);
  private readonly reportApi = inject(ReportService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly toast = inject(ToastService);

  protected readonly evaluation = signal<PerformanceEvaluation | null>(null);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);

  constructor() {
    effect(() => {
      this.review.studentId();
      this.load();
    });
  }

  protected decide(ev: PerformanceEvaluation, status: 'Approved' | 'Unapproved'): void {
    if (!ev.id || ev.advisor_approval === status) {
      return;
    }
    this.busy.set(true);
    this.submissionApi.setAdvisorApproval('student_supervisor_evaluation', ev.id, { advisor_approval: status }).subscribe({
      next: () => {
        this.busy.set(false);
        this.evaluation.set({ ...ev, advisor_approval: status });
        this.review.changed();
      },
      error: () => {
        this.busy.set(false);
        this.toast.error('Couldn’t save your decision', 'Please try again.');
      },
    });
  }

  private load(): void {
    this.reportApi.evaluationOf(this.review.studentId()).subscribe({
      next: (res) => {
        this.evaluation.set(res.payload[0] ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
