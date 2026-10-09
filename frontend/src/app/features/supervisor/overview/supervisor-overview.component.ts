import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentOjtStatus } from '../../../core/models/student';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SupervisorContextService } from '../supervisor-context.service';

/** What the supervisor's trainees have waiting, and who is at work right now. */
@Component({
  selector: 'app-supervisor-overview',
  imports: [DatePipe, RouterLink, PageHeaderComponent, IconComponent, EmptyStateComponent],
  template: `
    <app-page-header [eyebrow]="(today | date: 'EEEE, MMMM d') ?? ''" [title]="greeting + (firstName() ? ', ' + firstName() : '')"
      description="Here’s what your trainees have waiting for you." />

    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      @for (tile of tiles(); track tile.label) {
        <a [routerLink]="tile.link" class="card p-5 transition hover:shadow-raised">
          <p class="text-sm text-slate-500">{{ tile.label }}</p>
          <p class="mt-2 flex items-center gap-2 font-display text-3xl font-semibold text-slate-900">
            {{ tile.value ?? '–' }}
            @if (tile.alert && tile.value) {
              <span class="h-2 w-2 rounded-full bg-coral-500"></span>
            }
          </p>
        </a>
      }
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <section class="card overflow-hidden lg:col-span-2">
        <header class="border-b border-slate-100 p-5 sm:px-6">
          <h2 class="section-title">Needs your attention</h2>
        </header>
        @if (context.trainees() === null) {
          <div class="space-y-3 p-6">
            <div class="skeleton h-12"></div>
            <div class="skeleton h-12"></div>
          </div>
        } @else if (waiting().length === 0) {
          <app-empty-state icon="seal-check:duotone" title="You’re all caught up" [compact]="true"
            [description]="context.trainees()!.length === 0 ? 'Once you have trainees, their attendance and reports show up here for you to approve.' : 'Nothing from your trainees is waiting for you.'" />
        } @else {
          <ul class="divide-y divide-slate-100">
            @for (trainee of waiting(); track trainee.id) {
              @let work = context.workFor(trainee.id);
              <li class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <a [routerLink]="['/supervisor/trainees', trainee.id]" class="flex min-w-0 flex-1 items-center gap-3">
                  <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">{{ initials(trainee) }}</span>
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-medium text-slate-900 hover:underline">{{ trainee.firstName }} {{ trainee.lastName }}</span>
                    <span class="block truncate text-xs text-slate-500">{{ trainee.job_title || 'No job assigned' }}</span>
                  </span>
                </a>
                <div class="flex flex-wrap gap-2">
                  @if (work.days) {
                    <a [routerLink]="['/supervisor/trainees', trainee.id, 'attendance']" class="chip">
                      <app-icon name="clock" [size]="14" /> {{ work.days }} {{ work.days === 1 ? 'day' : 'days' }}
                    </a>
                  }
                  @if (work.reports) {
                    <a [routerLink]="['/supervisor/trainees', trainee.id, 'weekly-reports']" class="chip">
                      <app-icon name="note-pencil" [size]="14" /> {{ work.reports }} {{ work.reports === 1 ? 'report' : 'reports' }}
                    </a>
                  }
                  @if (work.evaluationDue) {
                    <a [routerLink]="['/supervisor/trainees', trainee.id, 'evaluation']" class="chip ring-coral-300 text-coral-700">
                      <app-icon name="medal" [size]="14" /> Evaluation due
                    </a>
                  }
                </div>
              </li>
            }
          </ul>
        }
      </section>

      <section class="card self-start overflow-hidden">
        <header class="border-b border-slate-100 p-5 sm:px-6">
          <h2 class="section-title">At work now</h2>
        </header>
        @if (onDuty().length === 0) {
          <p class="px-5 py-6 text-sm text-slate-500 sm:px-6">None of your trainees are clocked in.</p>
        } @else {
          <ul class="divide-y divide-slate-100">
            @for (trainee of onDuty(); track trainee.id) {
              <li class="flex items-center gap-3 px-5 py-3 sm:px-6">
                <span class="relative flex h-2.5 w-2.5">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                  <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <span class="text-sm text-slate-900">{{ trainee.firstName }} {{ trainee.lastName }}</span>
              </li>
            }
          </ul>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupervisorOverviewComponent {
  protected readonly context = inject(SupervisorContextService);
  protected readonly today = new Date();
  protected readonly greeting = this.today.getHours() < 12 ? 'Good morning' : this.today.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  protected readonly firstName = computed(() => this.context.profile()?.firstName ?? '');
  protected readonly waiting = computed(() =>
    (this.context.trainees() ?? []).filter((t) => this.context.pendingFor(t.id) > 0).sort((a, b) => this.context.pendingFor(b.id) - this.context.pendingFor(a.id)),
  );
  protected readonly onDuty = computed(() => (this.context.trainees() ?? []).filter((t) => t.clock_status === 'Clocked In'));

  protected readonly tiles = computed(() => {
    const totals = this.context.totals();
    return [
      { label: 'Trainees', value: this.context.trainees()?.length ?? null, link: '/supervisor/trainees', alert: false },
      { label: 'Days to approve', value: totals.days, link: '/supervisor/trainees', alert: true },
      { label: 'Weekly reports to review', value: totals.reports, link: '/supervisor/trainees', alert: true },
      { label: 'Evaluations due', value: totals.evaluations, link: '/supervisor/trainees', alert: true },
    ];
  });

  protected initials(trainee: StudentOjtStatus): string {
    return `${trainee.firstName.charAt(0)}${trainee.lastName.charAt(0)}`.toUpperCase();
  }
}
