import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent, NavGroup } from '../../../../shared/layout/app-shell/app-shell.component';
import { AdminUsersService } from '../../admin-users.service';

/** The administration area: accounts, coordinators and classes. */
@Component({
  selector: 'app-admin-layout',
  imports: [AppShellComponent, RouterOutlet],
  template: `
    <app-shell [navGroups]="nav()" [roleLabel]="users.myRole === 'superadmin' ? 'Super Admin' : 'Admin'">
      <router-outlet />
    </app-shell>
  `,
  // Tied to the layout: loaded at sign-in, discarded at sign-out.
  providers: [AdminUsersService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  protected readonly users = inject(AdminUsersService);

  protected readonly nav = computed<NavGroup[]>(() => [
    {
      label: 'People',
      items: [
        { label: 'Accounts', icon: 'user-circle', link: '/admin/users', badge: this.users.awaitingApproval().length },
        { label: 'Students', icon: 'student', link: '/admin/students' },
        { label: 'Coordinators', icon: 'chalkboard-teacher', link: '/admin/coordinators' },
        { label: 'Administrators', icon: 'key', link: '/admin/admins' },
      ],
    },
    {
      label: 'School',
      items: [{ label: 'Classes', icon: 'users-three', link: '/admin/classes' }],
    },
  ]);
}
