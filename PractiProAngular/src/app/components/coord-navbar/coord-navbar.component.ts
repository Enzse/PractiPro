import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CoordSidebarComponent } from '../coord-sidebar/coord-sidebar.component';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-coord-navbar',
  standalone: true,
  imports: [CoordSidebarComponent],
  templateUrl: './coord-navbar.component.html',
  styleUrl: './coord-navbar.component.css'
})
export class CoordNavbarComponent {

  constructor( @Inject(PLATFORM_ID) private platformId: Object) {
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }

}
