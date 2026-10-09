import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReportService } from '../../../../core/api/report.service';
import { SubmissionService } from '../../../../core/api/submission.service';
import { PerformanceEvaluation } from '../../../../core/models/records';
import { COMMENT_QUESTIONS, RATED_SECTIONS, RECOMMEND_QUESTION } from '../../../../shared/practicum/evaluation-questions';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ReviewActionsComponent } from '../review-actions.component';
import { StudentReviewContextService } from '../student-review-context.service';

/** The supervisor's performance evaluation of the student, for the coordinator to approve. */
@Component({
  selector: 'app-evaluation-tab',
  imports: [DatePipe, EmptyStateComponent, ReviewActionsComponent],
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

        @for (section of sections; track section.title) {
          <div class="border-b border-slate-100">
            <h3 class="bg-slate-50/60 px-5 py-2.5 text-sm font-semibold text-slate-900 sm:px-6">{{ section.title }}</h3>
            <ul class="divide-y divide-slate-100">
              @for (item of section.items; track item.key) {
                @let score = rating(ev, item.key);
                <li class="flex items-center justify-between gap-6 px-5 py-3 sm:px-6">
                  <span class="text-sm text-slate-700">{{ item.text }}</span>
                  <span class="flex shrink-0 items-center gap-2" [attr.aria-label]="'Rated ' + score + ' of 5'">
                    <span class="flex gap-0.5" aria-hidden="true">
                      @for (step of [1, 2, 3, 4, 5]; track step) {
                        <span class="h-2 w-4 rounded-sm" [class]="step <= score ? 'bg-data-blue' : 'bg-data-track'"></span>
                      }
                    </span>
                    <span class="w-4 text-right text-sm font-semibold text-slate-900">{{ score || '–' }}</span>
                  </span>
                </li>
              }
            </ul>
          </div>
        }

        <div class="grid gap-6 p-5 sm:grid-cols-3 sm:px-6">
          <div>
            <p class="eyebrow">Overall</p>
            <p class="mt-1 font-display text-xl font-semibold text-slate-900">{{ text(ev, 'p4q1') }}</p>
          </div>
          <div class="sm:col-span-2">
            <p class="eyebrow">Recommended for employment</p>
            <p class="mt-1 text-sm text-slate-700">
              <span class="font-semibold capitalize">{{ text(ev, recommend.key) }}</span>
              @if (text(ev, recommend.reasonKey) !== '—') {
                <span class="text-slate-500"> · {{ text(ev, recommend.reasonKey) }}</span>
              }
            </p>
          </div>
        </div>

        <dl class="grid gap-5 border-t border-slate-100 p-5 sm:grid-cols-2 sm:px-6">
          @for (question of comments; track question.key) {
            <div>
              <dt class="text-xs text-slate-500">{{ question.text }}</dt>
              <dd class="mt-1 whitespace-pre-line text-sm text-slate-800">{{ text(ev, question.key) }}</dd>
            </div>
          }
        </dl>
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

  protected readonly sections = RATED_SECTIONS;
  protected readonly comments = COMMENT_QUESTIONS;
  protected readonly recommend = RECOMMEND_QUESTION;
  protected readonly evaluation = signal<PerformanceEvaluation | null>(null);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);

  constructor() {
    effect(() => {
      this.review.studentId();
      this.load();
    });
  }

  protected rating(ev: PerformanceEvaluation, key: string): number {
    return Number(ev[key] ?? 0);
  }

  protected text(ev: PerformanceEvaluation, key: string): string {
    const value = ev[key];
    return value === null || value === undefined || value === '' ? '—' : String(value);
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
