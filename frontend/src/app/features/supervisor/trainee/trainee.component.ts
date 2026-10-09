import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs';
import { CompanyService } from '../../../core/api/company.service';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icons.generated';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { EVALUATION_HOURS, SupervisorContextService } from '../supervisor-context.service';
import { TraineeContextService } from './trainee-context.service';

/** One trainee: their attendance, reports, evaluation, and job and schedule. */
@Component({
  selector: 'app-trainee',
  imports: [DecimalPipe, RouterLink, RouterLinkActive, RouterOutlet, MatMenuModule, MatTooltipModule, OrdinalPipe, IconComponent, EmptyStateComponent],
  templateUrl: './trainee.component.html',
  providers: [TraineeContextService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TraineeComponent {
  protected readonly context = inject(TraineeContextService);
  private readonly supervisor = inject(SupervisorContextService);
  private readonly companyApi = inject(CompanyService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly requiredHours = EVALUATION_HOURS;

  protected readonly tabs = computed<{ path: string; label: string; icon: IconName; count: number }[]>(() => {
    const work = this.context.work();
    return [
      { path: 'attendance', label: 'Attendance', icon: 'clock', count: work.days },
      { path: 'weekly-reports', label: 'Weekly reports', icon: 'note-pencil', count: work.reports },
      { path: 'evaluation', label: 'Evaluation', icon: 'medal', count: work.evaluationDue ? 1 : 0 },
      { path: 'job', label: 'Job & schedule', icon: 'briefcase', count: 0 },
    ];
  });

  protected readonly initials = computed(() => {
    const t = this.context.trainee();
    return t ? `${t.firstName.charAt(0)}${t.lastName.charAt(0)}`.toUpperCase() : '';
  });

  constructor() {
    // On narrow screens the tab bar scrolls; keep the current tab in view.
    const host = inject(ElementRef<HTMLElement>);
    const reveal = () => host.nativeElement.querySelector('nav [aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
    effect(() => this.context.trainee() && setTimeout(reveal));
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => setTimeout(reveal));
  }

  protected hours(value: string | null | undefined): number {
    return Number(value ?? 0);
  }

  protected stopSupervising(): void {
    const trainee = this.context.trainee();
    if (!trainee) {
      return;
    }
    this.confirm
      .ask({
        title: `Stop supervising ${trainee.firstName}?`,
        message: 'They stay at your company, but you won’t review their attendance or reports any more. You can add them back later.',
        confirmText: 'Stop supervising',
        tone: 'danger',
      })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.companyApi.unassignFromSupervisor(trainee.id, this.supervisor.supervisorId).subscribe({
          next: () => {
            this.toast.info(`${trainee.firstName} is no longer your trainee`);
            this.supervisor.refresh();
            this.router.navigate(['/supervisor/trainees']);
          },
          error: () => this.toast.error('Couldn’t remove the trainee', 'Please try again.'),
        });
      });
  }
}
