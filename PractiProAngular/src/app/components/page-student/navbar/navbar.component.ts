import { Component, Inject, PLATFORM_ID, ChangeDetectionStrategy, inject } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';

import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../../services/session.service';

@Component({
    selector: 'app-navbar',
    imports: [SidebarComponent, RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './navbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private readonly session = inject(SessionService);
  data: any;
  constructor( @Inject(PLATFORM_ID) private platformId: Object) {
    this.data = this.session.userName();    
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }
}
