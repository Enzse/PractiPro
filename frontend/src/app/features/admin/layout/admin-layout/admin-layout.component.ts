import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../../core/auth/session.service';
import { SidebarService } from '../../../../core/layout/sidebar.service';

@Component({
    selector: 'app-admin-layout',
    imports: [AdminSidebarComponent, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './admin-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  protected readonly sidebarState = inject(SidebarService);
  /** The account menu under the user's name (opens on hover, or on tap). */
  protected readonly userMenuOpen = signal(false);
  private readonly session = inject(SessionService);

  data: any;
  constructor() {
    this.data = this.session.userName();    
  }


}
