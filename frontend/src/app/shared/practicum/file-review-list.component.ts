import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SubmissionService } from '../../core/api/submission.service';
import { CommentTable, SubmittedFile } from '../../core/models/records';
import { CommentsDialogComponent } from '../dialogs/comments-dialog/comments-dialog.component';
import { PdfViewerDialogComponent } from '../dialogs/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { saveAs } from '../utils/save-file';
import { IconComponent } from '../ui/icon/icon.component';
import { StatusBadgeComponent } from '../ui/status-badge/status-badge.component';
import { ToastService } from '../ui/toast/toast.service';
import { ConfirmService } from '../ui/confirm/confirm.service';
import { ReviewActionsComponent } from '../ui/review-actions/review-actions.component';

/** Uploaded files with everything a coordinator does to them: read, discuss, approve. */
@Component({
  selector: 'app-file-review-list',
  imports: [DatePipe, MatTooltipModule, IconComponent, StatusBadgeComponent, ReviewActionsComponent],
  template: `
    <ul class="divide-y divide-slate-100">
      @for (file of files(); track file.id) {
        <li class="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:px-6">
          <button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left" (click)="view(file)">
            <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coral-50 text-coral-600">
              <app-icon name="file-pdf" [size]="18" />
            </span>
            <span class="min-w-0">
              <span class="block truncate text-sm font-medium text-slate-900 hover:underline">{{ file.file_name }}</span>
              <span class="flex items-center gap-2 text-xs text-slate-500">
                Uploaded {{ file.created_at | date: 'MMM d, y · h:mm a' }}
                @if (file.advisor_approval === 'Pending') {
                  <app-status-badge status="Pending" />
                }
              </span>
            </span>
          </button>
          <div class="flex items-center gap-1 sm:shrink-0">
            <button type="button" class="btn btn-ghost btn-sm" (click)="openComments(file)">
              <app-icon name="chat-circle-text" [size]="16" />
              <span class="tabular-nums">{{ file.comments ?? 0 }}</span>
              <span class="sr-only">comments</span>
            </button>
            <button type="button" class="icon-btn h-8 w-8" matTooltip="Download" (click)="download(file)">
              <app-icon name="download-simple" [size]="16" label="Download" />
            </button>
            <button type="button" class="icon-btn h-8 w-8 hover:bg-red-50 hover:text-red-600" matTooltip="Delete" (click)="remove(file)">
              <app-icon name="trash" [size]="16" label="Delete" />
            </button>
            <span class="ml-2">
              <app-review-actions [status]="file.advisor_approval" [busy]="busyId() === file.id" (decide)="decide(file, $event)" />
            </span>
          </div>
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileReviewListComponent {
  readonly files = input.required<SubmittedFile[]>();
  readonly table = input.required<'submissions' | 'documentations'>();
  readonly commentsTable = input.required<CommentTable>();
  /** Emitted after anything changed, so the parent reloads. */
  readonly changed = output<void>();

  private readonly submissionApi = inject(SubmissionService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly busyId = signal<number | null>(null);

  protected view(file: SubmittedFile): void {
    this.submissionApi.download(this.table(), file.id).subscribe({
      next: (blob) =>
        this.dialog.open(PdfViewerDialogComponent, {
          data: { selectedPDF: blob, title: file.file_name },
          panelClass: 'app-dialog',
          width: '900px',
          maxWidth: '94vw',
        }),
      error: () => this.toast.error('Couldn’t open the file', 'Please try again.'),
    });
  }

  protected download(file: SubmittedFile): void {
    this.submissionApi.download(this.table(), file.id).subscribe({
      next: (blob) => saveAs(blob, file.file_name),
      error: () => this.toast.error('Download failed', 'Please try again.'),
    });
  }

  protected openComments(file: SubmittedFile): void {
    this.dialog
      .open(CommentsDialogComponent, {
        data: { submissionID: file.id, fileName: file.file_name, table: this.commentsTable() },
        panelClass: 'app-dialog',
        width: '600px',
      })
      .afterClosed()
      .subscribe(() => this.changed.emit());
  }

  protected decide(file: SubmittedFile, status: 'Approved' | 'Unapproved'): void {
    if (file.advisor_approval === status) {
      return;
    }
    this.busyId.set(file.id);
    this.submissionApi.setAdvisorApproval(this.table(), file.id, { advisor_approval: status }).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(status === 'Approved' ? 'Approved' : 'Returned to the student', file.file_name);
        this.changed.emit();
      },
      error: () => {
        this.busyId.set(null);
        this.toast.error('Couldn’t save your decision', 'You may not have permission to review this file.');
      },
    });
  }

  protected remove(file: SubmittedFile): void {
    this.confirm
      .ask({ title: 'Delete this file?', message: `“${file.file_name}” will be removed for the student too.`, confirmText: 'Delete', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.submissionApi.delete(this.table(), file.id).subscribe({
          next: () => {
            this.toast.success('File deleted');
            this.changed.emit();
          },
          error: () => this.toast.error('Couldn’t delete the file', 'You may not have permission to delete it.'),
        });
      });
  }
}
