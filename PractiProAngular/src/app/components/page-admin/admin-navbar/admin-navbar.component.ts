import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { RouterOutlet } from '@angular/router';
import { JwtService } from '../../../services/jwt.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [AdminSidebarComponent, RouterOutlet],
  templateUrl: './admin-navbar.component.html',
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
