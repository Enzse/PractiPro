import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SeminarService } from '../../../core/api/seminar.service';
import { SubmissionService } from '../../../core/api/submission.service';
import { SeminarRecord } from '../../../core/models/records';
import { AddSeminarDialogComponent } from '../../../shared/dialogs/add-seminar-dialog/add-seminar-dialog.component';
import { CommentsDialogComponent } from '../../../shared/dialogs/comments-dialog/comments-dialog.component';
import { PdfViewerDialogComponent } from '../../../shared/dialogs/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { matchesSearch } from '../../../shared/utils/search';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { FilterChipsComponent, FilterOption } from '../../../shared/ui/filter-chips/filter-chips.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { AddCertificateDialogComponent } from '../dialogs/add-certificate-dialog/add-certificate-dialog.component';
import { REQUIRED_SEMINAR_HOURS, StudentStatusService } from '../student-status.service';

@Component({
  selector: 'app-student-seminars',
  imports: [
    DatePipe, DecimalPipe, MatTooltipModule, PageHeaderComponent, IconComponent, StatusBadgeComponent,
    EmptyStateComponent, SearchFieldComponent, FilterChipsComponent,
  ],
  templateUrl: './student-seminars.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentSeminarsComponent implements OnInit {
  protected readonly status = inject(StudentStatusService);
  private readonly seminarApi = inject(SeminarService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly requiredHours = REQUIRED_SEMINAR_HOURS;
  protected readonly seminars = signal<SeminarRecord[]>([]);
  protected readonly loading = signal(true);
  protected readonly search = signal('');
  protected readonly statusFilter = signal('all');

  protected readonly pendingHours = computed(() =>
    this.seminars().filter((s) => s.advisor_approval === 'Pending').reduce((sum, s) => sum + Number(s.duration ?? 0), 0),
  );

  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const count = (status: string) => this.seminars().filter((s) => s.advisor_approval === status).length;
    return [
      { value: 'all', label: 'All', count: this.seminars().length },
      { value: 'Pending', label: 'Pending', count: count('Pending') },
      { value: 'Approved', label: 'Approved', count: count('Approved') },
      { value: 'Unapproved', label: 'Not approved', count: count('Unapproved') },
    ];
  });

  protected readonly visible = computed(() => {
    const filter = this.statusFilter();
    return this.seminars().filter((s) => (filter === 'all' || s.advisor_approval === filter) && matchesSearch(s, this.search()));
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.seminarApi.forStudent(this.status.studentId).subscribe({
      next: (res) => {
        this.seminars.set([...res.payload].sort((a, b) => Date.parse(b.event_date) - Date.parse(a.event_date)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private reload(): void {
    this.load();
    this.status.refresh();
  }

  protected add(): void {
    this.dialog
      .open(AddSeminarDialogComponent, { data: { id: this.status.studentId }, panelClass: 'app-dialog', width: '560px' })
      .afterClosed()
      .subscribe(() => this.reload());
  }

  protected addCertificate(seminar: SeminarRecord): void {
    this.dialog
      .open(AddCertificateDialogComponent, { data: { id: seminar.id, name: seminar.event_name }, panelClass: 'app-dialog', width: '560px' })
      .afterClosed()
      .subscribe(() => this.load());
  }

  protected viewCertificate(seminar: SeminarRecord): void {
    this.submissionApi.download('student_seminar_certificates', seminar.id).subscribe({
      next: (file) =>
        this.dialog.open(PdfViewerDialogComponent, {
          data: { selectedPDF: file, title: `Certificate: ${seminar.event_name}` },
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
      .ask({ title: 'Delete this seminar?', message: `“${seminar.event_name}” and its certificate will be removed.`, confirmText: 'Delete', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.seminarApi.delete(seminar.id).subscribe({
          next: () => {
            this.toast.success('Seminar deleted');
            this.reload();
          },
          error: () => this.toast.error('Couldn’t delete the seminar', 'Please try again.'),
        });
      });
  }
}
