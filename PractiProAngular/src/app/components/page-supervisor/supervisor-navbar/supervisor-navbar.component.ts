import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { SupervisorSidebarComponent } from '../supervisor-sidebar/supervisor-sidebar.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
    selector: 'app-supervisor-navbar',
    imports: [SupervisorSidebarComponent, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './supervisor-navbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './supervisor-navbar.component.css'
})
export class SupervisorNavbarComponent {
  protected readonly sidebarState = inject(SidebarService);
  /** The account menu under the user's name (opens on hover, or on tap). */
  protected readonly userMenuOpen = signal(false);
  private readonly session = inject(SessionService);
  data: any;
  constructor() {
    this.data = this.session.userName();
  }
}
