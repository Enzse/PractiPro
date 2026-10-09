import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, concatMap, forkJoin, map, of, switchMap } from 'rxjs';
import { SubmissionService } from '../../../core/api/submission.service';
import { WarService } from '../../../core/api/war.service';
import { WarActivity, WarRecord } from '../../../core/models/records';
import { CommentsDialogComponent } from '../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { TimePipe } from '../../../shared/pipes/time.pipe';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { StudentStatusService } from '../student-status.service';

/** An activity row being edited. `key` only identifies the row on screen. */
interface DraftRow {
  key: number;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
}

type WeekState = 'empty' | 'draft' | 'submitted' | 'approved' | 'returned';

const STATE_LOOK: Record<WeekState, { label: string; colour: string }> = {
  empty: { label: 'Not started', colour: 'text-slate-400' },
  draft: { label: 'Draft', colour: 'text-slate-500' },
  submitted: { label: 'In review', colour: 'text-amber-700' },
  approved: { label: 'Approved', colour: 'text-emerald-700' },
  returned: { label: 'Returned', colour: 'text-red-600' },
};

@Component({
  selector: 'app-student-weekly-reports',
  imports: [DatePipe, DecimalPipe, FormsModule, MatTooltipModule, TimePipe, PageHeaderComponent, IconComponent, StatusBadgeComponent],
  templateUrl: './student-weekly-reports.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentWeeklyReportsComponent implements OnInit {
  private readonly status = inject(StudentStatusService);
  private readonly warApi = inject(WarService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly stateLook = STATE_LOOK;
  protected readonly records = signal<WarRecord[]>([]);
  private readonly extraWeeks = signal<number[]>([1]);
  protected readonly selectedWeek = signal(1);

  /** Rows of the selected week: editable when it is a draft, read-only once submitted. */
  protected readonly rows = signal<DraftRow[]>([]);
  protected readonly savedActivities = signal<WarActivity[]>([]);
  private readonly snapshot = signal('[]');
  protected readonly loadingWeek = signal(true);
  protected readonly saving = signal(false);
  private nextKey = 1;

  protected readonly weeks = computed(() =>
    [...new Set([...this.extraWeeks(), ...this.records().map((record) => record.week)])].sort((a, b) => a - b),
  );
  protected readonly record = computed(() => this.records().find((record) => record.week === this.selectedWeek()) ?? null);
  protected readonly submitted = computed(() => this.record()?.isSubmitted === 1);
  protected readonly locked = computed(() => this.record()?.supervisor_approval === 'Approved');
  protected readonly totalHours = computed(() =>
    this.savedActivities().reduce((sum, activity) => sum + Number(activity.TotalHours ?? 0), 0),
  );

  ngOnInit(): void {
    this.loadRecords(() => {
      const latest = this.weeks()[this.weeks().length - 1] ?? 1;
      this.openWeek(latest);
    });
    this.submissionApi.weekNumbers('student_war_records', this.status.studentId).subscribe((weeks) => {
      if (weeks.length > 0) {
        this.extraWeeks.update((existing) => [...new Set([...existing, ...weeks])]);
      }
    });
  }

  protected weekState(week: number): WeekState {
    const record = this.records().find((r) => r.week === week);
    if (!record) {
      return 'empty';
    }
    if (record.isSubmitted !== 1) {
      return 'draft';
    }
    if (record.supervisor_approval === 'Unapproved' || record.advisor_approval === 'Unapproved') {
      return 'returned';
    }
    return record.supervisor_approval === 'Approved' && record.advisor_approval === 'Approved' ? 'approved' : 'submitted';
  }

  protected isDirty(): boolean {
    return !this.submitted() && JSON.stringify(this.comparable(this.rows())) !== this.snapshot();
  }

  protected selectWeek(week: number): void {
    if (week === this.selectedWeek()) {
      return;
    }
    if (!this.isDirty()) {
      this.openWeek(week);
      return;
    }
    this.confirm
      .ask({
        title: 'Discard your changes?',
        message: `Week ${this.selectedWeek()} has changes you haven’t saved.`,
        confirmText: 'Discard',
        cancelText: 'Keep editing',
        tone: 'danger',
      })
      .subscribe((yes) => yes && this.openWeek(week));
  }

  protected addWeek(): void {
    const next = Math.max(0, ...this.weeks()) + 1;
    this.extraWeeks.update((weeks) => [...weeks, next]);
    this.selectWeek(next);
  }

  protected addRow(): void {
    this.rows.update((rows) => [...rows, this.blankRow()]);
  }

  protected removeRow(row: DraftRow): void {
    this.rows.update((rows) => {
      const remaining = rows.filter((r) => r.key !== row.key);
      return remaining.length > 0 ? remaining : [this.blankRow()];
    });
  }

  protected saveDraft(): void {
    if (!this.validate(false)) {
      return;
    }
    this.save().subscribe({
      next: () => this.toast.success('Draft saved', `Week ${this.selectedWeek()} is saved. Submit it when the week is done.`),
      error: () => this.failed('Couldn’t save the draft'),
    });
  }

  protected submit(): void {
    if (!this.validate(true)) {
      return;
    }
    const week = this.selectedWeek();
    this.confirm
      .ask({
        title: `Submit your week ${week} report?`,
        message: 'Your supervisor and coordinator will review it. You can still edit it until your supervisor approves it.',
        confirmText: 'Submit report',
      })
      .pipe(
        switchMap((yes) => (yes ? this.save().pipe(concatMap((id) => this.warApi.setSubmitted({ id, isSubmitted: 1 })), map(() => true)) : of(false))),
      )
      .subscribe({
        next: (done) => {
          if (done) {
            this.toast.success(`Week ${week} report submitted`, 'Your supervisor will review it next.');
            this.loadRecords(() => this.openWeek(week));
          }
        },
        error: () => this.failed('Couldn’t submit the report'),
      });
  }

  /** Moves a submitted report back to draft so it can be changed. */
  protected edit(): void {
    const record = this.record();
    if (!record) {
      return;
    }
    this.confirm
      .ask({
        title: 'Edit this report?',
        message: 'It will be withdrawn from review, and its approvals reset, until you submit it again.',
        confirmText: 'Edit report',
      })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.warApi.setSubmitted({ id: record.id, isSubmitted: 0, status: null }).subscribe({
          next: () => {
            this.toast.info('Report moved back to draft', 'Make your changes, then submit it again.');
            this.loadRecords(() => this.openWeek(record.week));
          },
          error: () => this.failed('Couldn’t reopen the report'),
        });
      });
  }

  protected openComments(): void {
    const record = this.record();
    if (!record) {
      return;
    }
    this.dialog
      .open(CommentsDialogComponent, {
        data: { submissionID: record.id, fileName: `Week ${record.week} report`, table: 'comments_war' },
        panelClass: 'app-dialog',
        width: '600px',
      })
      .afterClosed()
      .subscribe(() => this.loadRecords());
  }

  private openWeek(week: number): void {
    this.selectedWeek.set(week);
    this.loadingWeek.set(true);
    const record = this.records().find((r) => r.week === week);
    if (!record) {
      this.showActivities([]);
      return;
    }
    this.warApi.activities(record.id).subscribe({
      next: (res) => this.showActivities(res.payload),
      error: () => this.showActivities([]),
    });
  }

  private showActivities(activities: WarActivity[]): void {
    this.savedActivities.set(activities);
    const rows = activities.map((activity) => ({
      key: this.nextKey++,
      description: activity.description ?? '',
      date: activity.date && activity.date !== '0000-00-00' ? activity.date : '',
      startTime: (activity.startTime ?? '').slice(0, 5),
      endTime: (activity.endTime ?? '').slice(0, 5),
    }));
    // An empty week starts with one blank row, which doesn't count as an unsaved change.
    const shown = rows.length > 0 ? rows : [this.blankRow()];
    this.rows.set(shown);
    this.snapshot.set(JSON.stringify(this.comparable(shown)));
    this.loadingWeek.set(false);
  }

  private loadRecords(then?: () => void): void {
    this.warApi.records(this.status.studentId).subscribe((res) => {
      this.records.set(res.payload);
      then?.();
    });
  }

  /** Saves the rows as the week's activities (creating the week's record if needed); emits the record id. */
  private save(): Observable<number> {
    this.saving.set(true);
    const week = this.selectedWeek();
    const rows = this.filledRows();
    const existing = this.record();
    const recordId$ = existing
      ? of(existing.id)
      : this.warApi.create({ student_id: this.status.studentId, week }).pipe(
          switchMap(() => this.warApi.records(this.status.studentId, week)),
          map((res) => res.payload[0].id),
        );

    return recordId$.pipe(
      concatMap((id) =>
        this.warApi.clearActivities(id).pipe(
          concatMap(() =>
            rows.length === 0
              ? of([])
              : forkJoin(rows.map((row) => this.warApi.addActivity({ war_id: id, date: row.date, description: row.description.trim(), startTime: row.startTime, endTime: row.endTime }))),
          ),
          map(() => id),
        ),
      ),
      map((id) => {
        this.saving.set(false);
        this.loadRecords(() => this.openWeek(week));
        return id;
      }),
    );
  }

  private validate(submitting: boolean): boolean {
    const rows = this.filledRows();
    if (submitting && rows.length === 0) {
      this.toast.warning('Nothing to submit yet', 'Describe at least one thing you did this week.');
      return false;
    }
    if (rows.some((row) => !row.date || !row.startTime || !row.endTime)) {
      this.toast.warning('Some activities are incomplete', 'Give every activity a date, a start time and an end time.');
      return false;
    }
    if (rows.some((row) => row.endTime <= row.startTime)) {
      this.toast.warning('Check your times', 'Each activity has to end after it starts.');
      return false;
    }
    return true;
  }

  /** Rows with a description; blank ones are ignored. */
  private filledRows(): DraftRow[] {
    return this.rows().filter((row) => row.description.trim() !== '');
  }

  private comparable(rows: DraftRow[]) {
    return rows.map(({ description, date, startTime, endTime }) => ({ description, date, startTime, endTime }));
  }

  private blankRow(): DraftRow {
    return { key: this.nextKey++, description: '', date: '', startTime: '09:00', endTime: '17:00' };
  }

  private failed(title: string): void {
    this.saving.set(false);
    this.toast.error(title, 'Please check your connection and try again.');
  }
}
