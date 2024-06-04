import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-supervisor-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './supervisor-sidebar.component.html',
  styleUrl: './supervisor-sidebar.component.css'
})
export class SupervisorSidebarComponent {
  constructor(private service: AuthService) { }

  selectedStudent: any;
  supervisorId: any;

  ngOnInit(): void {
    this.supervisorId = this.service.getCurrentUserId();
    console.log("ID: " + this.supervisorId);
  }
  
}
