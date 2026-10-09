import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../../core/auth/session.service';
import { SidebarService } from '../../../../core/layout/sidebar.service';

@Component({
    selector: 'app-coordinator-layout',
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './coordinator-layout.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-layout.component.css'
})
export class CoordinatorLayoutComponent {
  protected readonly sidebarState = inject(SidebarService);
  /** The account menu under the user's name (opens on hover, or on tap). */
  protected readonly userMenuOpen = signal(false);
  private readonly session = inject(SessionService);

  data: any;
  constructor() {
    this.data = this.session.userName();
  }


}
