import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { initFlowbite } from 'flowbite';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JwtService } from '../../../services/jwt.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SidebarComponent, CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  data: any;
  constructor( @Inject(PLATFORM_ID) private platformId: Object, private jwt: JwtService) {
    this.data = jwt.getUserName();    
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
  }
}
