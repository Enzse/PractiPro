import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { DtrService } from '../../../../core/api/dtr.service';
import { TimeRecord } from '../../../../core/models/records';
import { TimePipe } from '../../../../shared/pipes/time.pipe';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { FilterChipsComponent, FilterOption } from '../../../../shared/ui/filter-chips/filter-chips.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ReviewActionsComponent } from '../../../../shared/ui/review-actions/review-actions.component';
import { StudentReviewContextService } from '../student-review-context.service';

/** Daily time records. The supervisor normally approves these; coordinators can too. */
@Component({
  selector: 'app-attendance-tab',
  imports: [DatePipe, DecimalPipe, NgxPaginationModule, TimePipe, EmptyStateComponent, FilterChipsComponent, ReviewActionsComponent],
  template: `
    <section class="card overflow-hidden">
      <header class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 class="section-title">Attendance</h2>
          <p class="text-sm text-slate-500">The supervisor usually approves each day; you can approve or return days here too.</p>
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
          [title]="records()!.length === 0 ? 'No time records yet' : 'No matching records'"
          [description]="records()!.length === 0 ? 'Days the student clocks in and out show up here.' : 'Try another filter.'" />
      } @else {
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock in</th>
                <th>Clock out</th>
                <th class="text-right">Hours</th>
                <th class="text-right">Review</th>
              </tr>
            </thead>
            <tbody>
              @for (record of visible() | paginate: { itemsPerPage: 12, currentPage: page }; track record.id) {
                <tr>
                  <td class="whitespace-nowrap font-medium text-slate-900">{{ record.date | date: 'EEE, MMM d, y' }}</td>
                  <td class="whitespace-nowrap tabular-nums">{{ record.startTime | time: record.startTime }}</td>
                  <td class="whitespace-nowrap tabular-nums">{{ record.endTime ? (record.endTime | time: record.endTime) : '—' }}</td>
                  <td class="text-right font-medium tabular-nums text-slate-900">{{ record.totalHours ? (record.totalHours | number: '1.0-2') : '—' }}</td>
                  <td class="text-right">
                    <app-review-actions [status]="record.status" [busy]="busyId() === record.id"
                      [disabledReason]="record.endTime ? null : 'The student hasn’t clocked out yet.'" (decide)="decide(record, $event)" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
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
  private readonly review = inject(StudentReviewContextService);
  private readonly dtrApi = inject(DtrService);
  private readonly toast = inject(ToastService);

  protected readonly records = signal<TimeRecord[] | null>(null);
  protected readonly filter = signal('all');
  protected readonly busyId = signal<number | null>(null);
  protected page = 1;

  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const list = this.records() ?? [];
    const count = (status: string) => list.filter((r) => r.status === status).length;
    return [
      { value: 'all', label: 'All', count: list.length },
      { value: 'Pending', label: 'Pending', count: count('Pending') },
      { value: 'Approved', label: 'Approved', count: count('Approved') },
      { value: 'Unapproved', label: 'Returned', count: count('Unapproved') },
    ];
  });
  protected readonly visible = computed(() =>
    (this.records() ?? []).filter((r) => this.filter() === 'all' || r.status === this.filter()),
  );

  constructor() {
    effect(() => {
      this.review.studentId();
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
        this.review.changed();
      },
      error: () => {
        this.busyId.set(null);
        this.toast.error('Couldn’t save your decision', 'Please try again.');
      },
    });
  }

  private load(): void {
    this.dtrApi.forStudent(this.review.studentId()).subscribe({
      next: (res) => this.records.set([...res.payload].sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))),
      error: () => this.records.set([]),
    });
  }
}
