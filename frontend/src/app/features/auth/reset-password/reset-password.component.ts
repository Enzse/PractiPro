import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/api/auth.service';
import { SessionService } from '../../../core/auth/session.service';
import { passwordMatchValidator } from '../../../shared/validators/password-match.validator';
import { passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { PasswordRulesComponent } from '../../../shared/ui/password-rules/password-rules.component';
import { AuthShellComponent } from '../auth-shell.component';

/**
 * Without a token: ask for a reset link. With one (from the emailed link):
 * choose a new password.
 */
type Step = 'request' | 'sent' | 'checking' | 'choose' | 'done' | 'expired' | 'invalid';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, PasswordRulesComponent, AuthShellComponent],
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  private readonly authApi = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly token: string | undefined = inject(ActivatedRoute).snapshot.queryParams['token'];

  protected readonly step = signal<Step>(this.token ? 'checking' : 'request');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly requestForm = this.fb.group({
    // Someone signed in (e.g. changing their password from their profile) gets their email filled in.
    email: [inject(SessionService).email() ?? '', [Validators.required, Validators.email]],
  });
  protected readonly passwordForm = this.fb.group(
    {
      password: ['', [Validators.required, passwordStrengthValidator]],
      repeatPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );
  protected readonly password = toSignal(this.passwordForm.controls.password.valueChanges, { initialValue: '' });

  ngOnInit(): void {
    if (!this.token) return;
    this.authApi.checkResetToken(this.token).subscribe({
      next: () => this.step.set('choose'),
      error: (error) => this.step.set(error.status === 401 ? 'expired' : 'invalid'),
    });
  }

  protected sendLink(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.authApi.requestPasswordReset({ email: this.requestForm.getRawValue().email.trim() }).subscribe({
      next: () => {
        this.busy.set(false);
        this.step.set('sent');
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(error.status === 404
          ? 'No account uses that email address.'
          : error.error?.status?.message ?? 'We couldn’t send the link right now. Please try again.');
      },
    });
  }

  protected savePassword(): void {
    if (this.passwordForm.invalid || !this.token) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.authApi.resetPassword({ token: this.token, password: this.passwordForm.getRawValue().password }).subscribe({
      next: () => {
        this.busy.set(false);
        this.step.set('done');
      },
      error: (error) => {
        this.busy.set(false);
        this.error.set(error.error?.status?.message ?? 'We couldn’t change your password right now. Please try again.');
      },
    });
  }

  /** Start over with a fresh link after an expired or broken one. */
  protected requestAgain(): void {
    this.error.set(null);
    this.step.set('request');
  }
}
