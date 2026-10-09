import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionService } from '../../../core/auth/session.service';
import { SidebarService } from '../../../core/layout/sidebar.service';
import { IconComponent } from '../../ui/icon/icon.component';
import { IconName } from '../../ui/icon/icons.generated';

export interface NavItem {
  label: string;
  icon: IconName;
  link: string;
  /** Why the page isn't available yet; the item is shown greyed out with this as its tooltip. */
  locked?: string | null;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface MenuLink {
  label: string;
  icon: IconName;
  link: string;
}

/**
 * The frame around every signed-in page: sidebar navigation, a top bar with
 * the account menu, and the page itself (projected content). Each role's
 * layout passes in its own navigation.
 *
 * Extra slots: [shellTopbar] (left side of the top bar) and
 * [shellSidebarFooter] (bottom of the sidebar).
 */
@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, MatMenuModule, MatTooltipModule, IconComponent],
  templateUrl: './app-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly navGroups = input.required<NavGroup[]>();
  readonly roleLabel = input.required<string>();
  readonly menuLinks = input<MenuLink[]>([]);

  protected readonly sidebar = inject(SidebarService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly user = this.session.userName();
  protected readonly fullName = this.user ? `${this.user.firstName} ${this.user.lastName}` : 'Account';
  protected readonly initials = this.user
    ? `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase()
    : '?';

  protected signOut(): void {
    this.session.clear();
    this.router.navigate(['/login']);
  }
}
