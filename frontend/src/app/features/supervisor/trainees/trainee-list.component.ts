import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { StudentOjtStatus } from '../../../core/models/student';
import { matchesSearch } from '../../../shared/utils/search';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { EVALUATION_HOURS, SupervisorContextService } from '../supervisor-context.service';
import { AddTraineesDialogComponent, AddTraineesData } from './add-trainees-dialog.component';

/** The students this supervisor oversees. */
@Component({
  selector: 'app-trainee-list',
  imports: [DecimalPipe, RouterLink, PageHeaderComponent, IconComponent, EmptyStateComponent, SearchFieldComponent],
  template: `
    <app-page-header title="Trainees" description="The students you supervise. Those with something waiting for you are listed first.">
      <button pageActions type="button" class="btn btn-primary" [disabled]="!context.profile()?.company_id" (click)="addTrainees()">
        <app-icon name="plus" [size]="16" /> Add trainees
      </button>
    </app-page-header>

    <section class="card overflow-hidden">
      <div class="border-b border-slate-100 p-5 sm:p-6">
        <div class="w-full sm:w-80"><app-search-field [(value)]="search" placeholder="Search name, ID or job" /></div>
      </div>

      @if (context.trainees() === null) {
        <div class="space-y-3 p-6">
          @for (row of [1, 2, 3]; track row) {
            <div class="skeleton h-12"></div>
          }
        </div>
      } @else if (visible().length === 0) {
        @if (context.trainees()!.length === 0) {
          <app-empty-state icon="users-three:duotone" title="No trainees yet"
            description="Invite students to your company, then add the ones you’ll supervise.">
            <a routerLink="/supervisor/hiring" class="btn btn-secondary">Invite students</a>
            <button type="button" class="btn btn-primary" [disabled]="!context.profile()?.company_id" (click)="addTrainees()">Add trainees</button>
          </app-empty-state>
        } @else {
          <app-empty-state icon="users-three:duotone" title="No one matches" description="Try another search." [compact]="true" />
        }
      } @else {
        <ul class="divide-y divide-slate-100">
          @for (t of visible(); track t.id) {
            @let pending = context.pendingFor(t.id);
            <li>
              <a [routerLink]="[t.id]" class="group grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition hover:bg-slate-50/60 sm:grid-cols-[auto_1fr_12rem_7rem_auto] sm:px-6">
                <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">{{ initials(t) }}</span>
                <span class="min-w-0">
                  <span class="flex items-center gap-2">
                    <span class="truncate font-medium text-slate-900">{{ t.firstName }} {{ t.lastName }}</span>
                    @if (t.clock_status === 'Clocked In') {
                      <span class="badge badge-success shrink-0"><span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>At work</span>
                    }
                  </span>
                  <span class="block truncate text-xs text-slate-500">{{ t.job_title || 'No job assigned yet' }} · {{ t.studentId || 'No student ID' }}</span>
                </span>
                <span class="hidden items-center gap-2 sm:flex">
                  <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-data-track">
                    <span class="block h-full rounded-full bg-data-blue" [style.width.%]="(hours(t) / requiredHours) * 100"></span>
                  </span>
                  <span class="w-16 text-right text-xs tabular-nums text-slate-600">{{ hours(t) | number: '1.0-0' }}/{{ requiredHours }} h</span>
                </span>
                <span class="hidden text-right sm:block">
                  @if (pending > 0) {
                    <span class="badge badge-warning">{{ pending }} waiting</span>
                  } @else {
                    <span class="text-xs text-slate-400">Up to date</span>
                  }
                </span>
                <app-icon name="caret-right" [size]="16" class="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
              </a>
            </li>
          }
        </ul>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraineeListComponent {
  protected readonly context = inject(SupervisorContextService);
  private readonly dialog = inject(MatDialog);
  protected readonly requiredHours = EVALUATION_HOURS;
  protected readonly search = signal('');

  protected readonly visible = computed(() =>
    (this.context.trainees() ?? [])
      .filter((t) => matchesSearch({ name: `${t.firstName} ${t.lastName}`, id: t.studentId, job: t.job_title }, this.search()))
      .sort((a, b) => this.context.pendingFor(b.id) - this.context.pendingFor(a.id) || a.lastName.localeCompare(b.lastName)),
  );

  protected hours(t: StudentOjtStatus): number {
    return Number(t.TotalHoursWorked ?? 0);
  }

  protected initials(t: StudentOjtStatus): string {
    return `${t.firstName.charAt(0)}${t.lastName.charAt(0)}`.toUpperCase();
  }

  protected addTrainees(): void {
    const companyId = this.context.profile()?.company_id;
    if (!companyId) {
      return;
    }
    const data: AddTraineesData = {
      supervisorId: this.context.supervisorId,
      companyId,
      currentIds: (this.context.trainees() ?? []).map((t) => t.id),
    };
    this.dialog
      .open(AddTraineesDialogComponent, { data, panelClass: 'app-dialog', width: '560px' })
      .afterClosed()
      .subscribe(() => this.context.refresh());
  }
}
