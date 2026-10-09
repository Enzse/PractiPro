import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs';
import { StudentService } from '../../../core/api/student.service';
import { ClassService } from '../../../core/api/class.service';
import { ClassJoinService } from '../../../core/api/class-join.service';
import { ClassProfile, JoinRequest } from '../../../core/models/class';
import { StudentOjtStatus } from '../../../core/models/student';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { matchesSearch } from '../../../shared/utils/search';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ClassInvitationsDialogComponent } from '../dialogs/class-invitations-dialog/class-invitations-dialog.component';
import { StudentStatusService } from '../student-status.service';

@Component({
  selector: 'app-join-classes',
  imports: [DatePipe, RouterLink, PageHeaderComponent, IconComponent, EmptyStateComponent, SearchFieldComponent],
  templateUrl: './join-classes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinClassesComponent implements OnInit {
  private readonly status = inject(StudentStatusService);
  private readonly studentApi = inject(StudentService);
  private readonly classApi = inject(ClassService);
  private readonly classJoinApi = inject(ClassJoinService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly refresh = inject(DataRefreshService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly student = signal<StudentOjtStatus | null>(null);
  protected readonly classes = signal<ClassProfile[] | null>(null);
  protected readonly request = signal<JoinRequest | null>(null);
  protected readonly invitationCount = signal(0);
  protected readonly search = signal('');
  protected readonly busy = signal<string | null>(null);

  protected readonly profileIncomplete = computed(() => {
    const student = this.student();
    return !!student && (!student.program || !student.year);
  });
  protected readonly visible = computed(() => (this.classes() ?? []).filter((c) => matchesSearch(c, this.search())));

  ngOnInit(): void {
    this.studentApi.ojtStatus(this.status.studentId).subscribe((res) => {
      const student = res.payload[0] ?? null;
      this.student.set(student);
      if (student?.block) {
        this.router.navigate(['/student/dashboard']);
        return;
      }
      if (student?.program && student.year) {
        this.classApi.byCourseAndYear(student.program, student.year).subscribe({
          next: (classes) => this.classes.set(classes.payload),
          error: () => this.classes.set([]),
        });
      } else {
        this.classes.set([]);
      }
    });
    this.loadRequest();
    this.loadInvitationCount();

    // Declining an invitation in the dialog changes the count.
    this.refresh.changeDetected$
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadInvitationCount());
  }

  private loadRequest(): void {
    this.classJoinApi.requestsOfStudent(this.status.studentId).subscribe((res) => this.request.set(res.payload[0] ?? null));
  }

  private loadInvitationCount(): void {
    this.classJoinApi.invitationCountOfStudent(this.status.studentId).subscribe((res) => {
      this.invitationCount.set(Number(res.payload[0]?.invitationCount ?? 0));
    });
  }

  protected openInvitations(): void {
    this.dialog.open(ClassInvitationsDialogComponent, {
      data: { userId: this.status.studentId },
      panelClass: 'app-dialog',
      width: '480px',
    });
  }

  protected requestToJoin(block: string): void {
    if (this.invitationCount() > 0) {
      this.toast.info('You have an invitation waiting', 'Check your class invitation before sending a request.');
      this.openInvitations();
      return;
    }
    this.busy.set(block);
    this.classJoinApi.requestToJoin({ student_id: this.status.studentId, class: block }).subscribe({
      next: () => {
        this.busy.set(null);
        this.toast.success(`Request sent to ${block}`, 'You’ll get in once the class coordinator accepts it.');
        this.loadRequest();
      },
      error: (error) => {
        this.busy.set(null);
        error.status === 409
          ? this.toast.warning('You already have a pending request', 'Cancel it first to ask a different class.')
          : this.toast.error('Couldn’t send the request', 'Please try again.');
      },
    });
  }

  protected cancelRequest(request: JoinRequest): void {
    this.confirm
      .ask({ title: `Cancel your request to join ${request.class}?`, confirmText: 'Cancel request', cancelText: 'Keep it', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.classJoinApi.cancelRequest(request.student_id).subscribe({
          next: () => {
            this.request.set(null);
            this.toast.info('Request cancelled');
          },
          error: () => this.toast.error('Couldn’t cancel the request', 'Please try again.'),
        });
      });
  }
}
