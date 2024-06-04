import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { SupervisorSidebarComponent } from '../supervisor-sidebar/supervisor-sidebar.component';
import { RouterOutlet } from '@angular/router';
import { JwtService } from '../../../services/jwt.service';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-supervisor-navbar',
  standalone: true,
  imports: [SupervisorSidebarComponent, RouterOutlet],
  templateUrl: './supervisor-navbar.component.html',
  styleUrl: './supervisor-navbar.component.css'
})
export class SupervisorNavbarComponent {
  data: any;
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private jwt: JwtService) {
    this.data = this.jwt.getUserName();
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }
}
