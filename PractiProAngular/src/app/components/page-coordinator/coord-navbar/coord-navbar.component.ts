import { Component, Inject, PLATFORM_ID, ChangeDetectionStrategy, inject } from '@angular/core';
import { CoordSidebarComponent } from '../coord-sidebar/coord-sidebar.component';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../services/session.service';

@Component({
    selector: 'app-coord-navbar',
    imports: [CoordSidebarComponent, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './coord-navbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coord-navbar.component.css'
})
export class CoordNavbarComponent {
  private readonly session = inject(SessionService);

  data: any;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.data = this.session.userName();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }

}
