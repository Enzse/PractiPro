import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { SubmissionService } from '../../../../core/api/submission.service';
import { WarService } from '../../../../core/api/war.service';
import { WarActivity, WarRecord } from '../../../../core/models/records';
import { CommentsDialogComponent } from '../../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { TimePipe } from '../../../../shared/pipes/time.pipe';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ReviewActionsComponent } from '../../../../shared/ui/review-actions/review-actions.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { TraineeContextService } from '../trainee-context.service';

interface ReportView {
  record: WarRecord;
  activities: WarActivity[];
  hours: number;
}

/** Submitted weekly reports. The supervisor reviews them first; the coordinator after. */
@Component({
  selector: 'app-weekly-reports-tab',
  imports: [DatePipe, DecimalPipe, TimePipe, IconComponent, EmptyStateComponent, ReviewActionsComponent],
  template: `
    @if (reports() === null) {
      <div class="skeleton h-64 rounded-2xl"></div>
    } @else if (reports()!.length === 0) {
      <section class="card">
        <app-empty-state icon="note-pencil:duotone" title="No submitted reports yet"
          description="Weekly reports show up here when the trainee submits them." />
      </section>
    } @else {
      <div class="space-y-4">
        @for (report of reports(); track report.record.id) {
          @let open = expanded() === report.record.id;
          <section class="card overflow-hidden">
            <header class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:px-6">
              <button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left" (click)="toggle(report.record.id)" [attr.aria-expanded]="open">
                <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">{{ report.record.week }}</span>
                <span class="min-w-0">
                  <span class="block font-semibold text-slate-900">Week {{ report.record.week }}</span>
                  <span class="block text-xs text-slate-500">
                    {{ report.activities.length }} {{ report.activities.length === 1 ? 'activity' : 'activities' }} ·
                    {{ report.hours | number: '1.0-1' }} h · submitted {{ report.record.dateSubmitted | date: 'MMM d' }}
                  </span>
                </span>
                <app-icon name="caret-down" [size]="16" class="ml-1 text-slate-400 transition" [class.rotate-180]="open" />
              </button>
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" class="btn btn-ghost btn-sm" (click)="openComments(report.record)">
                  <app-icon name="chat-circle-text" [size]="16" />
                  <span class="tabular-nums">{{ report.record.comments ?? 0 }}</span>
                  <span class="sr-only">comments</span>
                </button>
                <app-review-actions [status]="report.record.supervisor_approval" [busy]="busyId() === report.record.id" (decide)="decide(report.record, $event)" />
              </div>
            </header>
            @if (open) {
              <ol class="divide-y divide-slate-100 border-t border-slate-100">
                @for (activity of report.activities; track $index) {
                  <li class="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:gap-6 sm:px-6">
                    <div class="shrink-0 sm:w-40">
                      <p class="text-sm font-medium text-slate-900">{{ activity.date | date: 'EEE, MMM d' }}</p>
                      <p class="text-xs tabular-nums text-slate-500">{{ activity.startTime | time: activity.startTime }} – {{ activity.endTime | time: activity.endTime }}</p>
                    </div>
                    <p class="flex-1 whitespace-pre-line text-sm leading-6 text-slate-700">{{ activity.description }}</p>
                  </li>
                }
              </ol>
            }
          </section>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeeklyReportsTabComponent {
  private readonly trainee = inject(TraineeContextService);
  private readonly warApi = inject(WarService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  protected readonly reports = signal<ReportView[] | null>(null);
  protected readonly expanded = signal<number | null>(null);
  protected readonly busyId = signal<number | null>(null);

  constructor() {
    effect(() => {
      this.trainee.studentId();
      this.load();
    });
  }

  protected toggle(id: number): void {
    this.expanded.update((current) => (current === id ? null : id));
  }

  protected decide(record: WarRecord, status: 'Approved' | 'Unapproved'): void {
    if (record.supervisor_approval === status) {
      return;
    }
    this.busyId.set(record.id);
    this.submissionApi.setSupervisorApproval('student_war_records', record.id, { supervisor_approval: status }).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(status === 'Approved' ? `Week ${record.week} approved` : `Week ${record.week} returned to the trainee`);
        this.load();
        this.trainee.changed();
      },
      error: () => {
        this.busyId.set(null);
        this.toast.error('Couldn’t save your decision', 'Please try again.');
      },
    });
  }

  protected openComments(record: WarRecord): void {
    this.dialog
      .open(CommentsDialogComponent, {
        data: { submissionID: record.id, fileName: `Week ${record.week} report`, table: 'comments_war' },
        panelClass: 'app-dialog',
        width: '600px',
      })
      .afterClosed()
      .subscribe(() => this.load());
  }

  private load(): void {
    this.warApi.records(this.trainee.studentId()).subscribe({
      next: (res) => {
        const submitted = res.payload.filter((r) => r.isSubmitted === 1).sort((a, b) => b.week - a.week);
        if (submitted.length === 0) {
          this.reports.set([]);
          return;
        }
        forkJoin(submitted.map((record) => this.warApi.activities(record.id))).subscribe((results) => {
          const views = submitted.map((record, i) => {
            const activities = results[i].payload;
            return { record, activities, hours: activities.reduce((sum, a) => sum + Number(a.TotalHours ?? 0), 0) };
          });
          this.reports.set(views);
          // Open the first report still waiting for the supervisor.
          if (this.expanded() === null) {
            this.expanded.set(views.find((v) => v.record.supervisor_approval === 'Pending')?.record.id ?? null);
          }
        });
      },
      error: () => this.reports.set([]),
    });
  }
}
