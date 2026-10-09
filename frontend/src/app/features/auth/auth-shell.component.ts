import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { IconName } from '../../shared/ui/icon/icons.generated';

const POINTS: { icon: IconName; text: string }[] = [
  { icon: 'clipboard-text', text: 'Requirements, attendance and weekly reports in one place' },
  { icon: 'seal-check', text: 'Coordinators and supervisors review and approve online' },
  { icon: 'list-checks', text: 'Every student can see exactly what’s left to do' },
];

/**
 * The frame of the sign-in, sign-up and account pages: a brand panel on the
 * left (hidden on small screens) and the page's form on the right.
 */
@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink, IconComponent],
  template: `
    <div class="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside class="relative hidden overflow-hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col">
        <div class="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-coral-500/25 blur-3xl"></div>

        <a routerLink="/welcome" class="relative flex items-center gap-3">
          <img src="assets/logo.png" alt="" class="h-10 w-10 rounded-full ring-2 ring-white/10" />
          <span class="font-display text-xl font-semibold tracking-[-0.01em]">PractiPro</span>
        </a>

        <div class="relative mt-auto">
          <p class="font-display text-4xl font-semibold leading-tight tracking-[-0.03em]">The practicum,<br />organized.</p>
          <ul class="mt-8 space-y-4">
            @for (point of points; track point.text) {
              <li class="flex items-start gap-3 text-brand-100">
                <span class="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                  <app-icon [name]="point.icon" [size]="16" />
                </span>
                {{ point.text }}
              </li>
            }
          </ul>
        </div>
        <p class="relative mt-12 text-xs text-brand-300">Gordon College · College of Computer Studies</p>
      </aside>

      <main class="flex flex-col bg-canvas px-4 py-8 sm:px-8">
        <a routerLink="/welcome" class="flex items-center gap-2.5 lg:hidden">
          <img src="assets/logo.png" alt="" class="h-9 w-9 rounded-full" />
          <span class="font-display text-lg font-semibold tracking-[-0.01em] text-slate-900">PractiPro</span>
        </a>
        <div class="flex flex-1 items-center justify-center py-10">
          <div class="w-full animate-fade-up" [class]="wide() ? 'max-w-xl' : 'max-w-sm'">
            <ng-content />
          </div>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthShellComponent {
  /** Wider column for longer forms such as sign-up. */
  readonly wide = input(false);
  protected readonly points = POINTS;
}
