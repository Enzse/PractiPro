import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { concatMap, from, toArray } from 'rxjs';
import { DtrService } from '../../../../core/api/dtr.service';
import { TimeRecord } from '../../../../core/models/records';
import { TimePipe } from '../../../../shared/pipes/time.pipe';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { FilterChipsComponent, FilterOption } from '../../../../shared/ui/filter-chips/filter-chips.component';
import { ReviewActionsComponent } from '../../../../shared/ui/review-actions/review-actions.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm/confirm.service';
import { EVALUATION_HOURS } from '../../supervisor-context.service';
import { TraineeContextService } from '../trainee-context.service';

/** The trainee's daily time records, for the supervisor to approve. Only approved hours count. */
@Component({
  selector: 'app-attendance-tab',
  imports: [DatePipe, DecimalPipe, NgxPaginationModule, TimePipe, IconComponent, EmptyStateComponent, FilterChipsComponent, ReviewActionsComponent],
  template: `
    <section class="card overflow-hidden">
      <header class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:px-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="section-title">Attendance</h2>
            <p class="text-sm text-slate-500">Approve the days the trainee really worked; only approved hours count toward their {{ requiredHours }}.</p>
          </div>
          @if (pending().length > 0) {
            <button type="button" class="btn btn-primary btn-sm" [disabled]="bulkBusy()" (click)="approveAll()">
              <app-icon [name]="bulkBusy() ? 'circle-notch' : 'check'" [size]="14" [class.animate-spin]="bulkBusy()" />
              Approve all {{ pending().length }} waiting
            </button>
          }
        </div>
        <app-filter-chips [options]="filterOptions()" [(value)]="filter" label="Filter by status" (valueChange)="page = 1" />
      </header>

      @if (records() === null) {
        <div class="space-y-3 p-6">
          @for (row of [1, 2, 3]; track row) {
            <div class="skeleton h-9"></div>
          }
        </div>
      } @else if (visible().length === 0) {
        <app-empty-state icon="clock:duotone" [compact]="true"
          [title]="records()!.length === 0 ? 'No time records yet' : filter() === 'Pending' ? 'You’re up to date' : 'Nothing here'"
          [description]="records()!.length === 0 ? 'Days the trainee clocks in and out show up here.' : filter() === 'Pending' ? 'Every day has been reviewed.' : 'No records match this filter.'" />
      } @else {
        <ul class="divide-y divide-slate-100">
          @for (record of visible() | paginate: { itemsPerPage: 12, currentPage: page }; track record.id) {
            <li class="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:px-6">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-slate-900">{{ record.date | date: 'EEE, MMM d, y' }}</p>
                <p class="text-xs tabular-nums text-slate-500">
                  {{ record.startTime | time: record.startTime }} – {{ record.endTime ? (record.endTime | time: record.endTime) : 'still at work' }}
                  @if (record.totalHours) {
                    · <span class="font-medium text-slate-700">{{ record.totalHours | number: '1.0-2' }} h</span>
                  }
                </p>
              </div>
              <app-review-actions [status]="record.status" [busy]="busyId() === record.id || bulkBusy()"
                [disabledReason]="record.endTime ? null : 'The trainee hasn’t clocked out yet.'" (decide)="decide(record, $event)" />
            </li>
          }
        </ul>
        @if (visible().length > 12) {
          <div class="border-t border-slate-100 px-4 py-3">
            <pagination-controls [responsive]="true" previousLabel="" nextLabel="" (pageChange)="page = $event" />
          </div>
        }
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceTabComponent {
  private readonly trainee = inject(TraineeContextService);
  private readonly dtrApi = inject(DtrService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly requiredHours = EVALUATION_HOURS;
  protected readonly records = signal<TimeRecord[] | null>(null);
  protected readonly filter = signal('Pending');
  protected readonly busyId = signal<number | null>(null);
  protected readonly bulkBusy = signal(false);
  protected page = 1;

  /** Finished days still waiting for a decision. */
  protected readonly pending = computed(() => (this.records() ?? []).filter((r) => r.status === 'Pending' && r.endTime));
  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const list = this.records() ?? [];
    const count = (status: string) => list.filter((r) => r.status === status).length;
    return [
      { value: 'Pending', label: 'Waiting', count: count('Pending') },
      { value: 'Approved', label: 'Approved', count: count('Approved') },
      { value: 'Unapproved', label: 'Returned', count: count('Unapproved') },
      { value: 'all', label: 'All', count: list.length },
    ];
  });
  protected readonly visible = computed(() => (this.records() ?? []).filter((r) => this.filter() === 'all' || r.status === this.filter()));

  constructor() {
    effect(() => {
      this.trainee.studentId();
      this.load();
    });
  }

  protected decide(record: TimeRecord, status: 'Approved' | 'Unapproved'): void {
    if (record.status === status) {
      return;
    }
    this.busyId.set(record.id);
    this.dtrApi.setStatus(record.id, { status }).subscribe({
      next: () => {
        this.busyId.set(null);
        this.records.update((list) => list?.map((r) => (r.id === record.id ? { ...r, status } : r)) ?? null);
        this.trainee.changed();
      },
      error: () => {
        this.busyId.set(null);
        this.toast.error('Couldn’t save your decision', 'Please try again.');
      },
    });
  }

  protected approveAll(): void {
    const days = this.pending();
    const hours = days.reduce((sum, r) => sum + Number(r.totalHours ?? 0), 0);
    this.confirm
      .ask({ title: `Approve ${days.length} ${days.length === 1 ? 'day' : 'days'}?`, message: `That adds ${Math.round(hours * 10) / 10} hours to the trainee’s total.`, confirmText: 'Approve all' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.bulkBusy.set(true);
        from(days)
          .pipe(concatMap((r) => this.dtrApi.setStatus(r.id, { status: 'Approved' })), toArray())
          .subscribe({
            next: () => {
              this.bulkBusy.set(false);
              this.toast.success(`${days.length} ${days.length === 1 ? 'day' : 'days'} approved`);
              this.load();
              this.trainee.changed();
            },
            error: () => {
              this.bulkBusy.set(false);
              this.toast.error('Some days weren’t approved', 'Please try again.');
              this.load();
            },
          });
      });
  }

  private load(): void {
    this.dtrApi.forStudent(this.trainee.studentId()).subscribe({
      next: (res) => {
        const first = this.records() === null;
        this.records.set([...res.payload].sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)));
        // Open on what needs doing; if nothing does, show everything.
        if (first && !res.payload.some((r) => r.status === 'Pending')) {
          this.filter.set('all');
        }
      },
      error: () => this.records.set([]),
    });
  }
}
