import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar.component';

import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../../core/auth/session.service';
import { SidebarService } from '../../../../core/layout/sidebar.service';

@Component({
    selector: 'app-student-layout',
    imports: [StudentSidebarComponent, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './student-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./student-layout.component.css']
})
export class StudentLayoutComponent {
  protected readonly sidebarState = inject(SidebarService);
  /** The account menu under the user's name (opens on hover, or on tap). */
  protected readonly userMenuOpen = signal(false);
  private readonly session = inject(SessionService);
  data: any;
  constructor() {
    this.data = this.session.userName();    
  }
}
