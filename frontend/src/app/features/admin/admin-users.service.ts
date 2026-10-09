import { Injectable, computed, inject, signal } from '@angular/core';
import { SessionService } from '../../core/auth/session.service';
import { UserService } from '../../core/api/user.service';
import { User } from '../../core/models/user';

/** Roles that register themselves and wait for an administrator's approval. */
const NEEDS_APPROVAL = ['advisor', 'supervisor'];

/**
 * Every account, shared by the admin pages and the menu's approval count.
 * Provided by the admin layout: created at sign-in, discarded at sign-out.
 */
@Injectable()
export class AdminUsersService {
  private readonly userApi = inject(UserService);
  private readonly session = inject(SessionService);
  readonly myId = this.session.requireUserId();
  readonly myRole = this.session.role();

  private readonly state = signal<User[] | null>(null);
  /** null until loaded. */
  readonly users = this.state.asReadonly();
  readonly awaitingApproval = computed(() =>
    (this.state() ?? []).filter((u) => !u.approved_at && NEEDS_APPROVAL.includes(u.role)),
  );

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.userApi.all().subscribe({
      next: (res) => this.state.set(res.payload ?? []),
      error: () => this.state.set([]),
    });
  }

  /** Superadmins manage everyone but other superadmins; admins manage non-admins. */
  canManage(user: User): boolean {
    if (user.id === this.myId) {
      return false;
    }
    return this.myRole === 'superadmin' ? user.role !== 'superadmin' : user.role !== 'admin' && user.role !== 'superadmin';
  }
}
