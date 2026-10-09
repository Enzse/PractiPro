import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from '../../../core/api/user.service';
import { User } from '../../../core/models/user';
import { RoleLabelPipe } from '../../../shared/pipes/role-label.pipe';
import { matchesSearch } from '../../../shared/utils/search';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { FilterChipsComponent, FilterOption } from '../../../shared/ui/filter-chips/filter-chips.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { AdminUsersService } from '../admin-users.service';
import { EditAccountData, EditAccountDialogComponent } from './edit-account-dialog.component';

const PAGE_SIZE = 12;

/** Every student, coordinator and supervisor account, with sign-up approvals. */
@Component({
  selector: 'app-accounts',
  imports: [MatTooltipModule, NgxPaginationModule, RoleLabelPipe, PageHeaderComponent, IconComponent, EmptyStateComponent, SearchFieldComponent, FilterChipsComponent],
  templateUrl: './accounts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsComponent {
  protected readonly users = inject(AdminUsersService);
  private readonly userApi = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly search = signal('');
  /** Starts on everyone; a banner points to sign-ups awaiting approval. */
  protected readonly filter = signal('all');
  protected readonly busyId = signal<number | null>(null);
  protected page = 1;

  /** Administrators have their own page. */
  private readonly accounts = computed(() => (this.users.users() ?? []).filter((u) => u.role !== 'admin' && u.role !== 'superadmin'));

  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const list = this.accounts();
    const count = (test: (u: User) => boolean) => list.filter(test).length;
    return [
      { value: 'all', label: 'All', count: list.length },
      { value: 'awaiting', label: 'Awaiting approval', count: this.users.awaitingApproval().length },
      { value: 'student', label: 'Students', count: count((u) => u.role === 'student') },
      { value: 'advisor', label: 'Coordinators', count: count((u) => u.role === 'advisor') },
      { value: 'supervisor', label: 'Supervisors', count: count((u) => u.role === 'supervisor') },
      { value: 'inactive', label: 'Not activated', count: count((u) => u.isActive !== 1) },
    ];
  });

  protected readonly visible = computed(() => {
    const filter = this.filter();
    const awaiting = new Set(this.users.awaitingApproval().map((u) => u.id));
    return this.accounts()
      .filter((u) => {
        switch (filter) {
          case 'awaiting':
            return awaiting.has(u.id);
          case 'inactive':
            return u.isActive !== 1;
          case 'all':
            return true;
          default:
            return u.role === filter;
        }
      })
      .filter((u) => matchesSearch({ name: `${u.firstName} ${u.lastName}`, email: u.email }, this.search()))
      .sort((a, b) => Number(awaiting.has(b.id)) - Number(awaiting.has(a.id)) || b.id - a.id);
  });

  protected isAwaiting(user: User): boolean {
    return !user.approved_at && (user.role === 'advisor' || user.role === 'supervisor');
  }

  protected approve(user: User): void {
    this.busyId.set(user.id);
    this.userApi.approve(user.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(`${user.firstName} ${user.lastName} can now sign in`);
        this.users.refresh();
      },
      error: () => {
        this.busyId.set(null);
        this.toast.error('Couldn’t approve the account', 'Please try again.');
      },
    });
  }

  protected reject(user: User): void {
    this.confirm
      .ask({ title: `Reject ${user.firstName} ${user.lastName}?`, message: 'Their sign-up will be deleted. They can register again later.', confirmText: 'Reject', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.userApi.delete(user.id).subscribe({
          next: () => {
            this.toast.info('Sign-up rejected');
            this.users.refresh();
          },
          error: () => this.toast.error('Couldn’t reject the sign-up', 'Please try again.'),
        });
      });
  }

  protected edit(user: User): void {
    const data: EditAccountData = { user, isSuperadmin: this.users.myRole === 'superadmin' };
    this.dialog
      .open(EditAccountDialogComponent, { data, panelClass: 'app-dialog', width: '520px' })
      .afterClosed()
      .subscribe((changed) => changed && this.users.refresh());
  }

  protected initials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
}
