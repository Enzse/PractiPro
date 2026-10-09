import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
    selector: 'app-navbar',
    imports: [SidebarComponent, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './navbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  protected readonly sidebarState = inject(SidebarService);
  /** The account menu under the user's name (opens on hover, or on tap). */
  protected readonly userMenuOpen = signal(false);
  private readonly session = inject(SessionService);
  data: any;
  constructor() {
    this.data = this.session.userName();    
  }
}
