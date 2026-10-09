import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../core/api/auth.service';
import { passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PasswordRulesComponent } from '../../../shared/ui/password-rules/password-rules.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/**
 * Creates an administrator account. Only a signed-in administrator can do this;
 * the new admin activates the account from their email. Closes with true when created.
 */
@Component({
  selector: 'app-add-admin-dialog',
  imports: [ReactiveFormsModule, DialogShellComponent, IconComponent, PasswordRulesComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="create()" novalidate>
      <app-dialog-shell title="Add an administrator" description="They’ll get an email with a link to activate the account." icon="key">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="admin-first">First name</label>
            <input id="admin-first" type="text" class="input" autocomplete="off" formControlName="firstName" />
            @if (invalid('firstName')) {
              <p class="field-error">Enter a first name.</p>
            }
          </div>
          <div>
            <label class="label" for="admin-last">Last name</label>
            <input id="admin-last" type="text" class="input" autocomplete="off" formControlName="lastName" />
            @if (invalid('lastName')) {
              <p class="field-error">Enter a last name.</p>
            }
          </div>
          <div class="sm:col-span-2">
            <label class="label" for="admin-email">Email</label>
            <input id="admin-email" type="email" class="input" autocomplete="off" formControlName="email" />
            @if (invalid('email')) {
              <p class="field-error">Enter a valid email address.</p>
            }
          </div>
          <div class="sm:col-span-2">
            <label class="label" for="admin-password">Temporary password</label>
            <div class="relative">
              <input id="admin-password" [type]="showPassword() ? 'text' : 'password'" class="input pr-10" autocomplete="new-password" formControlName="password" />
              <button type="button" class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-700"
                (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                <app-icon name="eye" [size]="16" />
              </button>
            </div>
            <app-password-rules [value]="password() ?? ''" />
            <p class="hint">Share it with them privately; they can change it after signing in.</p>
          </div>
        </div>

        <footer dialogFooter class="dialog-footer">
          <button type="button" class="btn btn-secondary" (click)="dialogRef.close(false)">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            @if (saving()) {
              <app-icon name="circle-notch" [size]="16" class="animate-spin" />
            }
            Create administrator
          </button>
        </footer>
      </app-dialog-shell>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAdminDialogComponent {
  protected readonly dialogRef = inject<MatDialogRef<AddAdminDialogComponent, boolean>>(MatDialogRef);
  private readonly authApi = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly saving = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
  });
  protected readonly password = toSignal(this.form.controls.password.valueChanges);

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.authApi.register({ ...this.form.getRawValue(), role: 'admin' }).subscribe({
      next: () => {
        this.toast.success('Administrator created', 'They need to activate the account from their email.');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.saving.set(false);
        this.toast.error('Couldn’t create the administrator', error.error?.status?.message ?? 'Please try again.');
      },
    });
  }
}
