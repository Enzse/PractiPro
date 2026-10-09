import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../core/api/user.service';
import { RoleOption, User } from '../../../core/models/user';
import { RoleLabelPipe } from '../../../shared/pipes/role-label.pipe';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';

export interface EditAccountData {
  user: User;
  /** Superadmins may also hand out admin roles. */
  isSuperadmin: boolean;
}

/** Changes an account's role or status, or deletes it. Closes with true if anything changed. */
@Component({
  selector: 'app-edit-account-dialog',
  imports: [ReactiveFormsModule, RoleLabelPipe, DialogShellComponent, IconComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" novalidate>
      <app-dialog-shell [title]="data.user.firstName + ' ' + data.user.lastName" [description]="data.user.email" icon="user-circle">
        <div class="space-y-5">
          <div>
            <label class="label" for="role">Role</label>
            <select id="role" class="input" formControlName="role">
              @for (role of roles(); track role.code) {
                <option [value]="role.code">{{ role.code | roleLabel }}</option>
              }
            </select>
            <p class="hint">Changing the role replaces their old role’s profile. It’s refused while records still depend on it (a student’s submissions, a supervisor’s hires).</p>
          </div>

          <label class="flex cursor-pointer items-start justify-between gap-4 rounded-xl p-4 ring-1 ring-slate-200">
            <span>
              <span class="block text-sm font-medium text-slate-900">Account active</span>
              <span class="block text-xs text-slate-500">Inactive accounts can’t sign in. New accounts become active when the person clicks the link in their email.</span>
            </span>
            <input type="checkbox" class="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-700 focus:ring-brand-600" formControlName="isActive" />
          </label>

          <div class="rounded-xl bg-red-50/60 p-4 ring-1 ring-red-100">
            <p class="text-sm font-medium text-red-800">Delete account</p>
            <p class="mt-0.5 text-xs text-red-700/80">Removes the account and everything it submitted. This can’t be undone.</p>
            <button type="button" class="btn btn-danger btn-sm mt-3" (click)="remove()">
              <app-icon name="trash" [size]="14" /> Delete account
            </button>
          </div>
        </div>

        <footer dialogFooter class="dialog-footer">
          <button type="button" class="btn btn-secondary" (click)="dialogRef.close(false)">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving() || form.pristine">
            @if (saving()) {
              <app-icon name="circle-notch" [size]="16" class="animate-spin" />
            }
            Save changes
          </button>
        </footer>
      </app-dialog-shell>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAccountDialogComponent implements OnInit {
  protected readonly data = inject<EditAccountData>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject<MatDialogRef<EditAccountDialogComponent, boolean>>(MatDialogRef);
  private readonly userApi = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly roles = signal<RoleOption[]>([]);
  protected readonly saving = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    role: [this.data.user.role as string],
    isActive: [this.data.user.isActive === 1],
  });

  ngOnInit(): void {
    this.userApi.roles().subscribe((res) =>
      this.roles.set(this.data.isSuperadmin ? res.payload : res.payload.filter((role) => !role.code.includes('admin'))),
    );
  }

  protected save(): void {
    this.saving.set(true);
    this.userApi.update(this.data.user.id, this.form.getRawValue()).subscribe({
      next: () => {
        this.toast.success('Account updated');
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Couldn’t update the account', 'The person may have records that block a role change.');
      },
    });
  }

  protected remove(): void {
    const { user } = this.data;
    this.confirm
      .ask({
        title: `Delete ${user.firstName} ${user.lastName}’s account?`,
        message: 'Their account and everything they submitted will be removed. This can’t be undone.',
        confirmText: 'Delete account',
        tone: 'danger',
      })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.userApi.delete(user.id).subscribe({
          next: () => {
            this.toast.success('Account deleted');
            this.dialogRef.close(true);
          },
          error: () => this.toast.error('Couldn’t delete the account', 'You may not have permission to delete it.'),
        });
      });
  }
}
