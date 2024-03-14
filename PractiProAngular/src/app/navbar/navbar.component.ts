import { Component } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}
