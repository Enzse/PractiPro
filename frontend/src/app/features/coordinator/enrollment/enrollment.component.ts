import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClassJoinService } from '../../../core/api/class-join.service';
import { StudentService } from '../../../core/api/student.service';
import { ClassInvitation, ClassJoinRequest } from '../../../core/models/class';
import { StudentLookup } from '../../../core/models/student';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { ClassContextService } from '../class-context.service';
import { CoordinatorClassesService } from '../coordinator-classes.service';

/** Getting students into the class: join requests, invitations and a shareable link. */
@Component({
  selector: 'app-enrollment',
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent, IconComponent, EmptyStateComponent],
  templateUrl: './enrollment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrollmentComponent {
  protected readonly context = inject(ClassContextService);
  private readonly classes = inject(CoordinatorClassesService);
  private readonly classJoinApi = inject(ClassJoinService);
  private readonly studentApi = inject(StudentService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly requests = signal<ClassJoinRequest[] | null>(null);
  protected readonly invitations = signal<ClassInvitation[] | null>(null);
  protected readonly busyId = signal<number | null>(null);

  protected readonly searchForm = inject(NonNullableFormBuilder).group({
    studentId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
  });
  protected readonly searching = signal(false);
  protected readonly found = signal<StudentLookup | null>(null);
  protected readonly notFound = signal(false);
  protected readonly alreadyInvited = signal(false);

  protected readonly link = signal<string | null>(null);
  protected readonly creatingLink = signal(false);

  constructor() {
    effect(() => {
      this.context.block();
      this.loadRequests();
      this.loadInvitations();
      this.link.set(null);
    });
  }

  // Join requests

  protected accept(request: ClassJoinRequest): void {
    this.busyId.set(request.id);
    this.studentApi.joinClass(request.student_id, { block_name: request.class }).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(`${request.studentFirstName} ${request.studentLastName} joined ${request.class}`);
        this.afterEnrollmentChange();
      },
      error: () => {
        this.busyId.set(null);
        this.toast.error('Couldn’t accept the request', 'Please try again.');
      },
    });
  }

  protected decline(request: ClassJoinRequest): void {
    this.confirm
      .ask({ title: `Decline ${request.studentFirstName}’s request?`, message: 'They can send a new request later.', confirmText: 'Decline', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.classJoinApi.rejectRequest(request.id).subscribe({
          next: () => {
            this.toast.info('Request declined');
            this.loadRequests();
          },
          error: () => this.toast.error('Couldn’t decline the request', 'Please try again.'),
        });
      });
  }

  // Invitations

  protected search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.searching.set(true);
    this.found.set(null);
    this.notFound.set(false);
    this.studentApi.byStudentNumber(this.searchForm.getRawValue().studentId).subscribe({
      next: (res) => {
        this.searching.set(false);
        const student = res.payload[0] ?? null;
        this.found.set(student);
        this.notFound.set(!student);
        if (student) {
          this.classJoinApi.invitationCount(student.id, this.context.block()).subscribe((count) =>
            this.alreadyInvited.set(Number(count.payload[0]?.invitationCount ?? 0) > 0),
          );
        }
      },
      error: () => {
        this.searching.set(false);
        this.notFound.set(true);
      },
    });
  }

  protected invite(student: StudentLookup): void {
    this.busyId.set(student.id);
    this.classJoinApi.invite({ student_id: student.id, advisor_id: this.classes.coordinatorId, class: this.context.block() }).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(`Invitation sent to ${student.firstName} ${student.lastName}`, 'They’ll see it when they sign in.');
        this.found.set(null);
        this.searchForm.reset();
        this.loadInvitations();
      },
      error: (error) => {
        this.busyId.set(null);
        error.status === 409
          ? this.toast.warning('Already invited', 'This student already has an invitation to this class.')
          : this.toast.error('Couldn’t send the invitation', 'Please try again.');
      },
    });
  }

  protected cancelInvitation(invitation: ClassInvitation): void {
    this.confirm
      .ask({ title: `Cancel the invitation to ${invitation.studentFirstName}?`, confirmText: 'Cancel invitation', cancelText: 'Keep it', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.classJoinApi.cancelInvitation(invitation.id).subscribe({
          next: () => {
            this.toast.info('Invitation cancelled');
            this.loadInvitations();
          },
          error: () => this.toast.error('Couldn’t cancel the invitation', 'Please try again.'),
        });
      });
  }

  // Join link

  protected createLink(): void {
    this.creatingLink.set(true);
    this.classJoinApi.createLink({ class: this.context.block() }).subscribe({
      next: (res) => {
        this.creatingLink.set(false);
        this.link.set(res.payload);
      },
      error: () => {
        this.creatingLink.set(false);
        this.toast.error('Couldn’t create a link', 'Please try again.');
      },
    });
  }

  protected async copyLink(link: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(link);
      this.toast.success('Link copied', 'Share it with your students. It works for 30 minutes.');
    } catch {
      this.toast.error('Couldn’t copy the link', 'Select it and copy it yourself.');
    }
  }

  private afterEnrollmentChange(): void {
    this.loadRequests();
    this.context.refresh();
    this.classes.refresh();
  }

  private loadRequests(): void {
    this.classJoinApi.requestsForClass(this.context.block()).subscribe({
      next: (res) => this.requests.set(res.payload),
      error: () => this.requests.set([]),
    });
  }

  private loadInvitations(): void {
    this.classJoinApi.invitationsForClass(this.context.block()).subscribe({
      next: (res) => this.invitations.set(res.payload),
      error: () => this.invitations.set([]),
    });
  }
}
