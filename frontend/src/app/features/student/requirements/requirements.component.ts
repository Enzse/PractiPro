import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { SubmissionService } from '../../../core/api/submission.service';
import { StudentService } from '../../../core/api/student.service';
import { SubmittedFile } from '../../../core/models/records';
import { StudentRequirements } from '../../../core/models/student';
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
import { REQUIREMENT_TYPES, RequirementType, requirementLabel } from '../../../shared/practicum/requirement-types';

type StatusFilter = 'all' | 'Pending' | 'Approved' | 'Unapproved';

@Component({
  selector: 'app-requirements',
  imports: [
    DatePipe, MatTooltipModule, NgxPaginationModule, PageHeaderComponent, IconComponent, FileDropComponent,
    StatusBadgeComponent, EmptyStateComponent, SearchFieldComponent, FilterChipsComponent,
  ],
  templateUrl: './requirements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequirementsComponent implements OnInit {
  private readonly status = inject(StudentStatusService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly studentApi = inject(StudentService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly types = REQUIREMENT_TYPES;
  protected readonly label = requirementLabel;

  protected readonly submissions = signal<SubmittedFile[]>([]);
  protected readonly approved = signal<StudentRequirements | null>(null);
  protected readonly loading = signal(true);

  protected readonly selected = signal<RequirementType>(REQUIREMENT_TYPES[0]);
  protected readonly file = signal<File | null>(null);
  protected readonly uploading = signal(false);

  protected readonly search = signal('');
  protected readonly statusFilter = signal<string>('all');
  protected page = 1;

  /** Each requirement's state: approved per the requirements view, otherwise its latest upload. */
  protected readonly typeStatus = computed(() => {
    const byType = new Map<string, string | null>();
    for (const type of REQUIREMENT_TYPES) {
      const latest = this.submissions().find((submission) => submission.submission_name === type.code);
      byType.set(type.code, this.approved()?.[type.field] ? 'Approved' : (latest?.advisor_approval ?? null));
    }
    return byType;
  });
  protected readonly approvedCount = computed(() => [...this.typeStatus().values()].filter((s) => s === 'Approved').length);

  protected readonly filterOptions = computed<FilterOption<StatusFilter>[]>(() => {
    const count = (status: string) => this.submissions().filter((s) => s.advisor_approval === status).length;
    return [
      { value: 'all', label: 'All', count: this.submissions().length },
      { value: 'Pending', label: 'Pending', count: count('Pending') },
      { value: 'Approved', label: 'Approved', count: count('Approved') },
      { value: 'Unapproved', label: 'Not approved', count: count('Unapproved') },
    ];
  });

  protected readonly visible = computed(() => {
    const filter = this.statusFilter();
    const text = this.search();
    return this.submissions().filter((submission) =>
      (filter === 'all' || submission.advisor_approval === filter) &&
      matchesSearch({ ...submission, label: requirementLabel(submission.submission_name) }, text),
    );
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.submissionApi.list('submissions', this.status.studentId).subscribe({
      next: (res) => {
        this.submissions.set([...res.payload].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.studentApi.requirements(this.status.studentId).subscribe((res) => this.approved.set(res.payload[0] ?? null));
  }

  protected select(type: RequirementType): void {
    this.selected.set(type);
    this.file.set(null);
  }

  protected upload(): void {
    const file = this.file();
    const type = this.selected();
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.submissionApi.upload('submissions', this.status.studentId, file, type.code).subscribe({
      next: () => {
        this.uploading.set(false);
        this.file.set(null);
        this.toast.success(`${type.label} uploaded`, 'Your coordinator will review it. You’ll see the result here.');
        this.load();
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error('Upload failed', 'Please check your connection and try again.');
      },
    });
  }

  protected download(submission: SubmittedFile): void {
    this.submissionApi.download('submissions', submission.id).subscribe({
      next: (data) => saveAs(data, submission.file_name),
      error: () => this.toast.error('Download failed', 'Please try again.'),
    });
  }

  protected remove(submission: SubmittedFile): void {
    this.confirm
      .ask({ title: 'Delete this file?', message: `“${submission.file_name}” will be removed permanently.`, confirmText: 'Delete', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.submissionApi.delete('submissions', submission.id).subscribe({
          next: () => {
            this.toast.success('File deleted');
            this.load();
          },
          error: () => this.toast.error('Couldn’t delete the file', 'You may not have permission to delete it.'),
        });
      });
  }

  protected openComments(submission: SubmittedFile): void {
    this.dialog
      .open(CommentsDialogComponent, {
        data: { submissionID: submission.id, fileName: submission.file_name, table: 'comments_requirements' },
        panelClass: 'app-dialog',
        width: '600px',
      })
      .afterClosed()
      .subscribe(() => this.load());
  }
}
