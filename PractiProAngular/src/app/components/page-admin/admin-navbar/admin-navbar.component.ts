import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
    selector: 'app-admin-navbar',
    imports: [AdminSidebarComponent, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './admin-navbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent {
  protected readonly sidebarState = inject(SidebarService);
  /** The account menu under the user's name (opens on hover, or on tap). */
  protected readonly userMenuOpen = signal(false);
  private readonly session = inject(SessionService);

  data: any;
  constructor() {
    this.data = this.session.userName();    
  }


}
