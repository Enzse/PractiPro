import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JwtService } from '../../../services/jwt.service';

@Component({
    selector: 'app-admin-navbar',
    imports: [AdminSidebarComponent, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './admin-navbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent implements OnInit {

  data: any;
  constructor( @Inject(PLATFORM_ID) private platformId: Object, private jwt: JwtService) {
    this.data = jwt.getUserName();    
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }


}
