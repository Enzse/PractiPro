import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReportService } from '../../../../core/api/report.service';
import { SubmissionService } from '../../../../core/api/submission.service';
import { FinalReport } from '../../../../core/models/records';
import { CRITERIA, OBJECTIVES } from '../../../../shared/practicum/final-report-questions';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ReviewActionsComponent } from '../review-actions.component';
import { StudentReviewContextService } from '../student-review-context.service';

/** The student's final report questionnaire, for the coordinator to approve. */
@Component({
  selector: 'app-final-report-tab',
  imports: [DatePipe, EmptyStateComponent, ReviewActionsComponent],
  template: `
    @if (loading()) {
      <div class="skeleton h-64 rounded-2xl"></div>
    } @else if (report(); as r) {
      <section class="card overflow-hidden">
        <header class="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 class="section-title">Final report</h2>
            <p class="text-sm text-slate-500">Submitted {{ r.created_at | date: 'MMMM d, y' }}.</p>
          </div>
          <app-review-actions [status]="r.advisor_approval" [busy]="busy()" (decide)="decide(r, $event)" />
        </header>

        <h3 class="bg-slate-50/60 px-5 py-2.5 text-sm font-semibold text-slate-900 sm:px-6">OJT experience</h3>
        <ul class="divide-y divide-slate-100">
          @for (c of criteria; track c.key) {
            <li class="flex items-start justify-between gap-6 px-5 py-3 sm:px-6">
              <span class="text-sm text-slate-700">{{ c.text }}</span>
              <span class="shrink-0 text-sm font-medium capitalize" [class]="text(r, c.key) === 'yes' ? 'text-slate-900' : 'text-slate-500'">
                {{ text(r, c.key) }}
                @if (c.key === 'p1q7' && text(r, 'p1q7') === 'yes' && text(r, 'p1q7x1') !== '—') {
                  <span class="font-normal normal-case text-slate-500">· {{ text(r, 'p1q7x1') }}@if (text(r, 'p1q7x1') === 'cash') { ({{ text(r, 'p1q7x2') }}/day) }</span>
                }
              </span>
            </li>
          }
        </ul>

        <h3 class="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-sm font-semibold text-slate-900 sm:px-6">Training objectives</h3>
        <ul class="divide-y divide-slate-100">
          @for (o of objectives; track o.key) {
            <li class="flex items-center gap-4 px-5 py-3 sm:px-6">
              <span class="flex-1 text-sm text-slate-700">{{ text(r, o.key) }}</span>
              <span class="h-1.5 w-24 overflow-hidden rounded-full bg-data-track">
                <span class="block h-full rounded-full bg-data-blue" [style.width.%]="percent(r, o.extent)"></span>
              </span>
              <span class="w-12 text-right text-sm font-medium text-slate-900">{{ text(r, o.extent) }}%</span>
            </li>
          }
        </ul>

        <div class="grid border-t border-slate-100 sm:grid-cols-3">
          <div class="p-5 sm:px-6">
            <p class="eyebrow">Overall rating</p>
            <p class="mt-1 font-display text-xl font-semibold text-slate-900">{{ text(r, 'p3q1') }}</p>
          </div>
          <div class="border-t border-slate-100 p-5 sm:col-span-2 sm:border-l sm:border-t-0 sm:px-6">
            <p class="eyebrow">Suggestions</p>
            <p class="mt-1 whitespace-pre-line text-sm text-slate-800">{{ text(r, 'p4q1') }}</p>
          </div>
        </div>
      </section>
    } @else {
      <section class="card">
        <app-empty-state icon="seal-check:duotone" title="No final report yet"
          description="Students can submit it once they reach 200 approved training hours." />
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalReportTabComponent {
  private readonly review = inject(StudentReviewContextService);
  private readonly reportApi = inject(ReportService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly toast = inject(ToastService);

  protected readonly criteria = CRITERIA;
  protected readonly objectives = OBJECTIVES;
  protected readonly report = signal<FinalReport | null>(null);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);

  constructor() {
    effect(() => {
      this.review.studentId();
      this.load();
    });
  }

  protected text(r: FinalReport, key: string): string {
    const value = r[key];
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }

  protected percent(r: FinalReport, key: string): number {
    return Number(r[key] ?? 0) || 0;
  }

  protected decide(r: FinalReport, status: 'Approved' | 'Unapproved'): void {
    if (!r.id || r.advisor_approval === status) {
      return;
    }
    this.busy.set(true);
    this.submissionApi.setAdvisorApproval('student_final_reports', r.id, { advisor_approval: status }).subscribe({
      next: () => {
        this.busy.set(false);
        this.report.set({ ...r, advisor_approval: status });
        this.review.changed();
      },
      error: () => {
        this.busy.set(false);
        this.toast.error('Couldn’t save your decision', 'Please try again.');
      },
    });
  }

  private load(): void {
    this.reportApi.finalReportOf(this.review.studentId()).subscribe({
      next: (res) => {
        this.report.set(res.payload[0] ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
