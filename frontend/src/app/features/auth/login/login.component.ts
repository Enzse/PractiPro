import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/auth/session.service';
import { AuthService } from '../../../core/api/auth.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { AuthShellComponent } from '../auth-shell.component';

/** Where each role lands after signing in. */
const HOME: Record<string, string> = {
  admin: '/admin/users',
  superadmin: '/admin/users',
  student: '/student/dashboard',
  advisor: '/coordinator/classes',
  supervisor: '/supervisor',
};

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, AuthShellComponent],
  template: `
    <app-auth-shell>
      <h1 class="font-display text-3xl font-semibold tracking-[-0.02em] text-slate-900">Welcome back</h1>
      <p class="mt-2 text-slate-500">Sign in to your PractiPro account.</p>

      @if (error(); as message) {
        <div class="mt-6 flex gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-100" role="alert">
          <app-icon name="warning-circle" [size]="18" class="mt-0.5 shrink-0" />
          <span>{{ message }}</span>
        </div>
      }

      <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="signIn()" novalidate>
        <div>
          <label class="label" for="email">Email</label>
          <input id="email" type="email" class="input h-11" autocomplete="email" formControlName="email" />
          @if (form.controls.email.invalid && form.controls.email.touched) {
            <p class="field-error">Enter your email address.</p>
          }
        </div>
        <div>
          <div class="mb-1.5 flex items-baseline justify-between">
            <label class="label mb-0" for="password">Password</label>
            <a routerLink="/reset-password" class="link text-xs">Forgot password?</a>
          </div>
          <div class="relative">
            <input id="password" [type]="showPassword() ? 'text' : 'password'" class="input h-11 pr-10" autocomplete="current-password" formControlName="password" />
            <button type="button" class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-700"
              (click)="showPassword.set(!showPassword())" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
              <app-icon name="eye" [size]="16" />
            </button>
          </div>
          @if (form.controls.password.invalid && form.controls.password.touched) {
            <p class="field-error">Enter your password.</p>
          }
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="busy()">
          @if (busy()) {
            <app-icon name="circle-notch" [size]="18" class="animate-spin" />
          }
          Sign in
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-slate-500">
        New to PractiPro? <a routerLink="/register" class="link">Create an account</a>
      </p>
    </app-auth-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly session = inject(SessionService);
  private readonly authApi = inject(AuthService);
  private readonly router = inject(Router);
  private readonly returnUrl: string | undefined = inject(ActivatedRoute).snapshot.queryParams['returnUrl'];

  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor() {
    // Opening the sign-in page signs out whoever was signed in.
    this.session.clear();
  }

  protected signIn(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.authApi.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.session.saveToken(res.token);
        const home = HOME[this.session.role() ?? ''];
        this.router.navigateByUrl(this.returnUrl ?? home ?? '/login');
      },
      error: (error) => {
        this.busy.set(false);
        if (error.status === 401) {
          this.error.set('That email and password don’t match an account.');
        } else if (error.status === 403) {
          const awaitingApproval = String(error.error?.status?.message ?? '').includes('approval');
          this.error.set(awaitingApproval
            ? 'Your account is waiting for an administrator’s approval. You can sign in once it’s approved.'
            : 'Your account isn’t activated yet. Click the link in the email we sent you when you signed up.');
        } else {
          this.error.set('We couldn’t sign you in right now. Please try again.');
        }
      },
    });
  }
}
