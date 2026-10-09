import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SeminarService } from '../../../../core/api/seminar.service';
import { SubmissionService } from '../../../../core/api/submission.service';
import { SeminarRecord } from '../../../../core/models/records';
import { CommentsDialogComponent } from '../../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { PdfViewerDialogComponent } from '../../../../shared/dialogs/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm/confirm.service';
import { ReviewActionsComponent } from '../review-actions.component';
import { StudentReviewContextService } from '../student-review-context.service';

/** Seminars and webinars the student attended; approved hours count toward the requirement. */
@Component({
  selector: 'app-seminars-tab',
  imports: [DatePipe, DecimalPipe, MatTooltipModule, IconComponent, EmptyStateComponent, ReviewActionsComponent],
  template: `
    @if (seminars() === null) {
      <div class="skeleton h-64 rounded-2xl"></div>
    } @else if (seminars()!.length === 0) {
      <section class="card">
        <app-empty-state icon="chalkboard-teacher:duotone" title="No seminars recorded" description="Seminars the student adds show up here for approval." />
      </section>
    } @else {
      <section class="card overflow-hidden">
        <header class="flex items-center justify-between gap-4 border-b border-slate-100 p-5 sm:px-6">
          <h2 class="section-title">Seminars</h2>
          <span class="text-sm text-slate-500"><span class="font-semibold text-slate-900">{{ approvedHours() | number: '1.0-1' }} h</span> approved</span>
        </header>
        <ul class="divide-y divide-slate-100">
          @for (seminar of seminars(); track seminar.id) {
            <li class="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:px-6">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-900">{{ seminar.event_name }}</p>
                <p class="text-xs text-slate-500">
                  {{ seminar.event_type || 'Other' }} · {{ seminar.event_date | date: 'MMM d, y' }} ·
                  <span class="font-medium text-slate-700">{{ seminar.duration | number: '1.0-2' }} h</span>
                </p>
              </div>
              <div class="flex items-center gap-1 sm:shrink-0">
                @if (seminar.certified === 1) {
                  <button type="button" class="btn btn-ghost btn-sm text-emerald-700" (click)="viewCertificate(seminar)">
                    <app-icon name="certificate" [size]="16" /> Certificate
                  </button>
                } @else {
                  <span class="px-2 text-xs text-slate-400">No certificate</span>
                }
                <button type="button" class="btn btn-ghost btn-sm" (click)="openComments(seminar)">
                  <app-icon name="chat-circle-text" [size]="16" />
                  <span class="tabular-nums">{{ seminar.comments ?? 0 }}</span>
                  <span class="sr-only">comments</span>
                </button>
                <button type="button" class="icon-btn h-8 w-8 hover:bg-red-50 hover:text-red-600" matTooltip="Delete" (click)="remove(seminar)">
                  <app-icon name="trash" [size]="16" label="Delete" />
                </button>
                <span class="ml-2">
                  <app-review-actions [status]="seminar.advisor_approval" [busy]="busyId() === seminar.id" (decide)="decide(seminar, $event)" />
                </span>
              </div>
            </li>
          }
        </ul>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeminarsTabComponent {
  private readonly review = inject(StudentReviewContextService);
  private readonly seminarApi = inject(SeminarService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly seminars = signal<SeminarRecord[] | null>(null);
  protected readonly busyId = signal<number | null>(null);
  protected readonly approvedHours = computed(() =>
    (this.seminars() ?? []).filter((s) => s.advisor_approval === 'Approved').reduce((sum, s) => sum + Number(s.duration ?? 0), 0),
  );

  constructor() {
    effect(() => {
      this.review.studentId();
      this.load();
    });
  }

  protected decide(seminar: SeminarRecord, status: 'Approved' | 'Unapproved'): void {
    if (seminar.advisor_approval === status) {
      return;
    }
    this.busyId.set(seminar.id);
    this.submissionApi.setAdvisorApproval('student_seminar_records', seminar.id, { advisor_approval: status }).subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
        this.review.changed();
      },
      error: () => {
        this.busyId.set(null);
        this.toast.error('Couldn’t save your decision', 'Please try again.');
      },
    });
  }

  protected viewCertificate(seminar: SeminarRecord): void {
    this.submissionApi.download('student_seminar_certificates', seminar.id).subscribe({
      next: (blob) =>
        this.dialog.open(PdfViewerDialogComponent, {
          data: { selectedPDF: blob, title: `Certificate: ${seminar.event_name}` },
          panelClass: 'app-dialog',
          width: '900px',
          maxWidth: '94vw',
        }),
      error: () => this.toast.error('Couldn’t open the certificate', 'Please try again.'),
    });
  }

  protected openComments(seminar: SeminarRecord): void {
    this.dialog
      .open(CommentsDialogComponent, {
        data: { submissionID: seminar.id, fileName: seminar.event_name, table: 'comments_seminar_records' },
        panelClass: 'app-dialog',
        width: '600px',
      })
      .afterClosed()
      .subscribe(() => this.load());
  }

  protected remove(seminar: SeminarRecord): void {
    this.confirm
      .ask({ title: 'Delete this seminar?', message: `“${seminar.event_name}” will be removed for the student too.`, confirmText: 'Delete', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.seminarApi.delete(seminar.id).subscribe({
          next: () => {
            this.toast.success('Seminar deleted');
            this.load();
            this.review.changed();
          },
          error: () => this.toast.error('Couldn’t delete the seminar', 'Please try again.'),
        });
      });
  }

  private load(): void {
    this.seminarApi.forStudent(this.review.studentId()).subscribe({
      next: (res) => this.seminars.set([...res.payload].sort((a, b) => Date.parse(b.event_date) - Date.parse(a.event_date))),
      error: () => this.seminars.set([]),
    });
  }
}
