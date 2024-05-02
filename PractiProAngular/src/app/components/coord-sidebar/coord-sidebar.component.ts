import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-coord-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './coord-sidebar.component.html',
  styleUrl: './coord-sidebar.component.css'
})
export class CoordSidebarComponent {

}
