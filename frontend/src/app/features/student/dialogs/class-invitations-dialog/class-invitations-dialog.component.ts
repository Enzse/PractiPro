import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { StudentService } from '../../../../core/api/student.service';
import { ClassJoinService } from '../../../../core/api/class-join.service';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { StudentInvitation } from '../../../../core/models/class';
import { DialogShellComponent } from '../../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm/confirm.service';

/** A coordinator's invitation to join their class. */
@Component({
  selector: 'app-class-invitations-dialog',
  imports: [DialogShellComponent, IconComponent, EmptyStateComponent],
  templateUrl: './class-invitations-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassInvitationsDialogComponent implements OnInit {
  private readonly data = inject<{ userId: number }>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<ClassInvitationsDialogComponent>);
  private readonly studentApi = inject(StudentService);
  private readonly classJoinApi = inject(ClassJoinService);
  private readonly refresh = inject(DataRefreshService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly invitation = signal<StudentInvitation | null>(null);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);

  ngOnInit(): void {
    this.classJoinApi.invitationsOfStudent(this.data.userId).subscribe({
      next: (res) => {
        this.invitation.set(res.payload[0] ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected join(invitation: StudentInvitation): void {
    this.busy.set(true);
    this.studentApi.joinClass(invitation.student_id, { block_name: invitation.class }).subscribe({
      next: () => {
        this.refresh.notifyChange(true);
        this.toast.success(`You joined ${invitation.class}`, 'Next, upload your requirements.');
        this.dialogRef.close(true);
        this.router.navigate(['/student/dashboard']);
      },
      error: () => {
        this.busy.set(false);
        this.toast.error('Couldn’t join the class', 'Please try again.');
      },
    });
  }

  protected decline(invitation: StudentInvitation): void {
    this.confirm
      .ask({
        title: 'Decline this invitation?',
        message: 'Only do this if the invitation was sent to you by mistake.',
        confirmText: 'Decline',
        tone: 'danger',
      })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.busy.set(true);
        this.classJoinApi.cancelInvitationsOfStudent(invitation.student_id).subscribe({
          next: () => {
            this.refresh.notifyChange(true);
            this.toast.info('Invitation declined');
            this.dialogRef.close(false);
          },
          error: () => {
            this.busy.set(false);
            this.toast.error('Couldn’t decline the invitation', 'Please try again.');
          },
        });
      });
  }
}
