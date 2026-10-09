import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CoordSidebarComponent } from '../coord-sidebar/coord-sidebar.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
    selector: 'app-coord-navbar',
    imports: [CoordSidebarComponent, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './coord-navbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coord-navbar.component.css'
})
export class CoordNavbarComponent {
  protected readonly sidebarState = inject(SidebarService);
  /** The account menu under the user's name (opens on hover, or on tap). */
  protected readonly userMenuOpen = signal(false);
  private readonly session = inject(SessionService);

  data: any;
  constructor() {
    this.data = this.session.userName();
  }


}
