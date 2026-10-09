import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent, NavGroup } from '../../../../shared/layout/app-shell/app-shell.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { SupervisorContextService } from '../../supervisor-context.service';

/** The supervisor area: trainees, hiring and the company. */
@Component({
  selector: 'app-supervisor-layout',
  imports: [AppShellComponent, RouterOutlet, IconComponent],
  template: `
    <app-shell [navGroups]="nav()" roleLabel="Supervisor">
      <ng-container shellTopbar>
        @if (companyName(); as name) {
          <span class="badge badge-brand"><app-icon name="buildings" [size]="14" /> {{ name }}</span>
        }
      </ng-container>
      <router-outlet />
    </app-shell>
  `,
  // Tied to the layout: loaded at sign-in, discarded at sign-out.
  providers: [SupervisorContextService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupervisorLayoutComponent {
  private readonly context = inject(SupervisorContextService);

  protected readonly companyName = computed(() => {
    const id = this.context.profile()?.company_id;
    return this.context.trainees()?.find((t) => t.company_id === id)?.company_name ?? null;
  });

  protected readonly nav = computed<NavGroup[]>(() => [
    {
      items: [
        { label: 'Overview', icon: 'squares-four', link: '/supervisor/overview' },
        { label: 'Trainees', icon: 'users-three', link: '/supervisor/trainees' },
      ],
    },
    {
      label: 'Company',
      items: [
        { label: 'Hiring', icon: 'user-plus', link: '/supervisor/hiring' },
        { label: 'Company profile', icon: 'buildings', link: '/supervisor/company' },
      ],
    },
  ]);
}
