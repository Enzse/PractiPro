import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { SubmissionService } from '../../../core/api/submission.service';
import { SubmittedFile } from '../../../core/models/records';
import { CommentsDialogComponent } from '../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { saveAs } from '../../../shared/utils/save-file';
import { matchesSearch } from '../../../shared/utils/search';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { FileDropComponent } from '../../../shared/ui/file-drop/file-drop.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { FilterChipsComponent, FilterOption } from '../../../shared/ui/filter-chips/filter-chips.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { StudentStatusService } from '../student-status.service';

@Component({
  selector: 'app-student-documentation',
  imports: [
    DatePipe, MatTooltipModule, NgxPaginationModule, PageHeaderComponent, IconComponent, FileDropComponent,
    StatusBadgeComponent, EmptyStateComponent, SearchFieldComponent, FilterChipsComponent,
  ],
  templateUrl: './student-documentation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDocumentationComponent implements OnInit {
  private readonly status = inject(StudentStatusService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly documents = signal<SubmittedFile[]>([]);
  protected readonly weeks = signal<number[]>([1]);
  protected readonly loading = signal(true);

  protected readonly selectedWeek = signal(1);
  protected readonly file = signal<File | null>(null);
  protected readonly uploading = signal(false);

  protected readonly search = signal('');
  protected readonly statusFilter = signal('all');
  protected page = 1;

  /** Per week: how many files, and the status of the latest one. */
  protected readonly weekSummary = computed(() => {
    const summary = new Map<number, { count: number; status: string | null }>();
    for (const week of this.weeks()) {
      const files = this.documents().filter((doc) => doc.week === week);
      summary.set(week, { count: files.length, status: files[0]?.advisor_approval ?? null });
    }
    return summary;
  });

  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const count = (status: string) => this.documents().filter((doc) => doc.advisor_approval === status).length;
    return [
      { value: 'all', label: 'All', count: this.documents().length },
      { value: 'Pending', label: 'Pending', count: count('Pending') },
      { value: 'Approved', label: 'Approved', count: count('Approved') },
      { value: 'Unapproved', label: 'Not approved', count: count('Unapproved') },
    ];
  });

  protected readonly visible = computed(() => {
    const filter = this.statusFilter();
    const text = this.search();
    return this.documents().filter((doc) =>
      (filter === 'all' || doc.advisor_approval === filter) && matchesSearch({ ...doc, weekLabel: `week ${doc.week}` }, text),
    );
  });

  ngOnInit(): void {
    this.load();
    this.submissionApi.weekNumbers('documentations', this.status.studentId).subscribe((weeks) => {
      if (weeks.length > 0) {
        this.weeks.set(weeks);
        this.selectedWeek.set(weeks[weeks.length - 1]);
      }
    });
  }

  private load(): void {
    this.submissionApi.list('documentations', this.status.studentId).subscribe({
      next: (res) => {
        this.documents.set([...res.payload].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected selectWeek(week: number): void {
    this.selectedWeek.set(week);
    this.file.set(null);
  }

  protected addWeek(): void {
    const next = Math.max(0, ...this.weeks()) + 1;
    this.weeks.update((weeks) => [...weeks, next]);
    this.selectWeek(next);
  }

  protected upload(): void {
    const file = this.file();
    const week = this.selectedWeek();
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.submissionApi.upload('documentations', this.status.studentId, file, week).subscribe({
      next: () => {
        this.uploading.set(false);
        this.file.set(null);
        this.toast.success(`Week ${week} documentation uploaded`, 'Your coordinator will review it.');
        this.load();
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error('Upload failed', 'Please check your connection and try again.');
      },
    });
  }

  protected download(doc: SubmittedFile): void {
    this.submissionApi.download('documentations', doc.id).subscribe({
      next: (data) => saveAs(data, doc.file_name),
      error: () => this.toast.error('Download failed', 'Please try again.'),
    });
  }

  protected remove(doc: SubmittedFile): void {
    this.confirm
      .ask({ title: 'Delete this file?', message: `“${doc.file_name}” will be removed permanently.`, confirmText: 'Delete', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.submissionApi.delete('documentations', doc.id).subscribe({
          next: () => {
            this.toast.success('File deleted');
            this.load();
          },
          error: () => this.toast.error('Couldn’t delete the file', 'You may not have permission to delete it.'),
        });
      });
  }

  protected openComments(doc: SubmittedFile): void {
    this.dialog
      .open(CommentsDialogComponent, {
        data: { submissionID: doc.id, fileName: doc.file_name, table: 'comments_documentation' },
        panelClass: 'app-dialog',
        width: '600px',
      })
      .afterClosed()
      .subscribe(() => this.load());
  }
}
