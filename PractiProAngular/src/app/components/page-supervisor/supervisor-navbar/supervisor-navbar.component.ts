import { Component } from '@angular/core';
import { SupervisorSidebarComponent } from '../supervisor-sidebar/supervisor-sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-supervisor-navbar',
  standalone: true,
  imports: [SupervisorSidebarComponent, RouterOutlet],
  templateUrl: './supervisor-navbar.component.html',
  styleUrl: './supervisor-navbar.component.css'
})
export class SupervisorNavbarComponent {

}
