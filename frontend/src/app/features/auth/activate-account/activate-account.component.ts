import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/api/auth.service';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { AuthShellComponent } from '../auth-shell.component';

/** Opened from the activation email: activates the account straight away. */
@Component({
  selector: 'app-activate-account',
  imports: [RouterLink, IconComponent, AuthShellComponent],
  template: `
    <app-auth-shell>
      @switch (state()) {
        @case ('activating') {
          <div class="flex flex-col items-center py-10 text-slate-500">
            <app-icon name="circle-notch" [size]="28" class="animate-spin text-brand-700" />
            <p class="mt-4 text-sm">Activating your account…</p>
          </div>
        }
        @case ('invalid') {
          <div class="text-center">
            <span class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <app-icon name="warning" [size]="32" />
            </span>
            <h1 class="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-slate-900">This link doesn’t work</h1>
            <p class="mt-3 text-slate-600">
              It may have been used already. If your account is activated, you can sign in; otherwise check that you opened the whole link from the email.
            </p>
            <a routerLink="/login" class="btn btn-primary btn-lg mt-8 w-full">Go to sign in</a>
          </div>
        }
        @default {
          <div class="text-center">
            <span class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <app-icon name="check-circle" [size]="32" />
            </span>
            <h1 class="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-slate-900">Account activated</h1>
            @if (state() === 'awaiting-approval') {
              <p class="mt-3 text-slate-600">
                One more step: an administrator needs to approve your account. You can sign in once it’s approved.
              </p>
            } @else {
              <p class="mt-3 text-slate-600">You’re all set. Sign in to get started.</p>
            }
            <a routerLink="/login" class="btn btn-primary btn-lg mt-8 w-full">Go to sign in</a>
          </div>
        }
      }
    </app-auth-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivateAccountComponent implements OnInit {
  private readonly authApi = inject(AuthService);
  private readonly token: string | undefined = inject(ActivatedRoute).snapshot.queryParams['token'];

  protected readonly state = signal<'activating' | 'activated' | 'awaiting-approval' | 'invalid'>('activating');

  ngOnInit(): void {
    if (!this.token) {
      this.state.set('invalid');
      return;
    }
    this.authApi.activate({ token: this.token }).subscribe({
      next: (res) => this.state.set(res.payload?.awaitingApproval ? 'awaiting-approval' : 'activated'),
      error: () => this.state.set('invalid'),
    });
  }
}
