import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { SupervisorSidebarComponent } from '../supervisor-sidebar/supervisor-sidebar.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../../core/auth/session.service';
import { SidebarService } from '../../../../core/layout/sidebar.service';

@Component({
    selector: 'app-supervisor-layout',
    imports: [SupervisorSidebarComponent, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './supervisor-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './supervisor-layout.component.css'
})
export class SupervisorLayoutComponent {
  protected readonly sidebarState = inject(SidebarService);
  /** The account menu under the user's name (opens on hover, or on tap). */
  protected readonly userMenuOpen = signal(false);
  private readonly session = inject(SessionService);
  data: any;
  constructor() {
    this.data = this.session.userName();
  }
}
