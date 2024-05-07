import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [AdminSidebarComponent, RouterOutlet],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css'
})
export class AdminNavbarComponent implements OnInit {

  constructor( @Inject(PLATFORM_ID) private platformId: Object) {
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }


}
