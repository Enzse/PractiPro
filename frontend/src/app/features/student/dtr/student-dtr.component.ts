import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { DtrService } from '../../../core/api/dtr.service';
import { TimeRecord } from '../../../core/models/records';
import { TimePipe } from '../../../shared/pipes/time.pipe';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { FilterChipsComponent, FilterOption } from '../../../shared/ui/filter-chips/filter-chips.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { REQUIRED_TRAINING_HOURS, StudentStatusService } from '../student-status.service';

interface DayRecord extends TimeRecord {
  /** Week of the practicum, counted from the hire date (week 1 starts that day); null before it. */
  week: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-student-dtr',
  imports: [
    DatePipe, DecimalPipe, TimePipe, MatTooltipModule, NgxPaginationModule, PageHeaderComponent, IconComponent,
    StatusBadgeComponent, EmptyStateComponent, FilterChipsComponent,
  ],
  templateUrl: './student-dtr.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDtrComponent implements OnInit {
  protected readonly status = inject(StudentStatusService);
  private readonly dtrApi = inject(DtrService);
  private readonly toast = inject(ToastService);

  protected readonly requiredHours = REQUIRED_TRAINING_HOURS;
  protected readonly now = signal(new Date());
  private readonly raw = signal<TimeRecord[]>([]);
  protected readonly loading = signal(true);

  /** Newest first, numbered by practicum week once the hire date is known. */
  protected readonly records = computed<DayRecord[]>(() => {
    const hireDate = this.status.student()?.hire_date;
    const hired = hireDate ? new Date(hireDate + 'T00:00:00').getTime() : null;
    return this.raw()
      .map((record) => {
        const week = hired === null ? null : Math.floor((new Date(record.date + 'T00:00:00').getTime() - hired) / (7 * DAY_MS)) + 1;
        // Records dated before the hire date belong to no practicum week.
        return { ...record, week: week !== null && week >= 1 ? week : null };
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));
  });
  protected readonly busy = signal(false);
  protected readonly statusFilter = signal('all');
  protected page = 1;

  protected readonly today = computed(() => this.records().find((record) => record.date === localDate(this.now())) ?? null);
  protected readonly clockedIn = computed(() => !!this.today() && !this.today()!.endTime);

  protected readonly weekHours = computed(() => {
    const start = startOfWeek(this.now());
    return this.records()
      .filter((record) => new Date(record.date + 'T00:00:00') >= start)
      .reduce((sum, record) => sum + Number(record.totalHours ?? 0), 0);
  });
  protected readonly pendingCount = computed(() => this.records().filter((record) => record.status === 'Pending').length);

  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const count = (status: string) => this.records().filter((record) => record.status === status).length;
    return [
      { value: 'all', label: 'All days', count: this.records().length },
      { value: 'Pending', label: 'Pending', count: count('Pending') },
      { value: 'Approved', label: 'Approved', count: count('Approved') },
      { value: 'Unapproved', label: 'Not approved', count: count('Unapproved') },
    ];
  });
  protected readonly visible = computed(() =>
    this.statusFilter() === 'all' ? this.records() : this.records().filter((record) => record.status === this.statusFilter()),
  );

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.dtrApi.forStudent(this.status.studentId).subscribe({
      next: (res) => {
        this.raw.set(res.payload);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected clockIn(): void {
    this.busy.set(true);
    this.dtrApi.clockIn(this.status.studentId).subscribe({
      next: () => {
        this.busy.set(false);
        this.toast.success('Clocked in', `Started at ${formatTime(new Date())}. Remember to clock out before you leave.`);
        this.afterChange();
      },
      error: (error) => {
        this.busy.set(false);
        error.status === 400
          ? this.toast.warning('You’re already clocked in', 'Clock out first before starting a new record.')
          : this.toast.error('Couldn’t clock in', 'Please try again.');
      },
    });
  }

  protected clockOut(): void {
    this.busy.set(true);
    this.dtrApi.clockOut(this.status.studentId).subscribe({
      next: () => {
        // Records shorter than an hour are discarded by the server.
        this.dtrApi.clearShortRecords(this.status.studentId).subscribe((res) => {
          this.busy.set(false);
          res.status.message.includes('Successfully deleted')
            ? this.toast.warning('Not recorded', 'A record has to be at least an hour long to count.')
            : this.toast.success('Clocked out', 'Your supervisor will review today’s record.');
          this.afterChange();
        });
      },
      error: (error) => {
        this.busy.set(false);
        error.status === 400
          ? this.toast.warning('You haven’t clocked in yet', 'There’s no open record for today.')
          : this.toast.error('Couldn’t clock out', 'Please try again.');
      },
    });
  }

  private afterChange(): void {
    this.load();
    this.status.refresh();
  }
}

function localDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Monday of the given date's week, at midnight. */
function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
