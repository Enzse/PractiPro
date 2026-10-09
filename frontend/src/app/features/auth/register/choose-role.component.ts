import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icons.generated';
import { AuthShellComponent } from '../auth-shell.component';

/** The first step of signing up: who are you? */
@Component({
  selector: 'app-choose-role',
  imports: [RouterLink, IconComponent, AuthShellComponent],
  template: `
    <app-auth-shell [wide]="true">
      <h1 class="font-display text-3xl font-semibold tracking-[-0.02em] text-slate-900">Create your account</h1>
      <p class="mt-2 text-slate-500">Choose how you’ll use PractiPro.</p>

      <ul class="mt-6 space-y-3">
        @for (role of roles; track role.path) {
          <li>
            <a [routerLink]="['/register', role.path]"
              class="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-raised">
              <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-800 group-hover:text-white">
                <app-icon [name]="role.icon" [size]="24" />
              </span>
              <span class="flex-1">
                <span class="block font-semibold text-slate-900">{{ role.label }}</span>
                <span class="block text-sm text-slate-500">{{ role.description }}</span>
              </span>
              <app-icon name="arrow-right" [size]="18" class="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
            </a>
          </li>
        }
      </ul>

      <p class="mt-8 text-center text-sm text-slate-500">
        Already have an account? <a routerLink="/login" class="link">Sign in</a>
      </p>
    </app-auth-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseRoleComponent {
  protected readonly roles: { path: string; label: string; description: string; icon: IconName }[] = [
    { path: 'student', label: 'Student', description: 'Doing your practicum: submit requirements, log hours and reports.', icon: 'student' },
    { path: 'coordinator', label: 'Coordinator', description: 'Faculty running a practicum class. Needs an administrator’s approval.', icon: 'chalkboard-teacher' },
    { path: 'supervisor', label: 'Company supervisor', description: 'Supervising trainees at your company. Needs an administrator’s approval.', icon: 'buildings' },
  ];
}
