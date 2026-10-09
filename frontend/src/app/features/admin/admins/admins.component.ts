import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from '../../../core/models/user';
import { RoleLabelPipe } from '../../../shared/pipes/role-label.pipe';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { AdminUsersService } from '../admin-users.service';
import { EditAccountData, EditAccountDialogComponent } from '../accounts/edit-account-dialog.component';
import { AddAdminDialogComponent } from './add-admin-dialog.component';

/** The people who run PractiPro. */
@Component({
  selector: 'app-admins',
  imports: [MatTooltipModule, RoleLabelPipe, PageHeaderComponent, IconComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Administrators" description="People who can manage accounts, coordinators and classes.">
      <button pageActions type="button" class="btn btn-primary" (click)="add()"><app-icon name="plus" [size]="16" /> Add administrator</button>
    </app-page-header>

    <section class="card overflow-hidden">
      @if (users.users() === null) {
        <div class="space-y-3 p-6">
          <div class="skeleton h-12"></div>
          <div class="skeleton h-12"></div>
        </div>
      } @else if (admins().length === 0) {
        <app-empty-state icon="users-three:duotone" title="No other administrators" [compact]="true" />
      } @else {
        <ul class="divide-y divide-slate-100">
          @for (user of admins(); track user.id) {
            <li class="flex items-center gap-3 px-5 py-3.5 sm:px-6">
              <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-800 text-xs font-semibold text-white">{{ initials(user) }}</span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-900">
                  {{ user.firstName }} {{ user.lastName }}
                  @if (user.id === users.myId) {
                    <span class="font-normal text-slate-400">(you)</span>
                  }
                </p>
                <p class="truncate text-xs text-slate-500">{{ user.email }}</p>
              </div>
              <span class="badge badge-brand hidden sm:inline-flex">{{ user.role | roleLabel }}</span>
              @if (user.isActive === 1) {
                <span class="badge badge-success">Active</span>
              } @else {
                <span class="badge badge-neutral">Not activated</span>
              }
              <span class="w-8">
                @if (users.canManage(user)) {
                  <button type="button" class="icon-btn h-8 w-8" matTooltip="Edit account" (click)="edit(user)">
                    <app-icon name="pencil-simple" [size]="16" label="Edit account" />
                  </button>
                }
              </span>
            </li>
          }
        </ul>
      }
    </section>
    @if (users.myRole !== 'superadmin') {
      <p class="mt-3 text-center text-xs text-slate-500">Only a super admin can change other administrators.</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminsComponent {
  protected readonly users = inject(AdminUsersService);
  private readonly dialog = inject(MatDialog);

  protected readonly admins = computed(() =>
    (this.users.users() ?? [])
      .filter((u) => u.role === 'admin' || u.role === 'superadmin')
      .sort((a, b) => Number(b.role === 'superadmin') - Number(a.role === 'superadmin') || a.lastName.localeCompare(b.lastName)),
  );

  protected add(): void {
    this.dialog
      .open(AddAdminDialogComponent, { panelClass: 'app-dialog', width: '560px' })
      .afterClosed()
      .subscribe((created) => created && this.users.refresh());
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
