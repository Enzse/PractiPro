import { Component, Inject, PLATFORM_ID, ChangeDetectionStrategy, inject } from '@angular/core';
import { SupervisorSidebarComponent } from '../supervisor-sidebar/supervisor-sidebar.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { SessionService } from '../../../services/session.service';

@Component({
    selector: 'app-supervisor-navbar',
    imports: [SupervisorSidebarComponent, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './supervisor-navbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './supervisor-navbar.component.css'
})
export class SupervisorNavbarComponent {
  private readonly session = inject(SessionService);
  data: any;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.data = this.session.userName();
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }
}
