import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { BlockService } from '../../../services/block.service';

@Component({
  selector: 'app-supervisor-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './supervisor-sidebar.component.html',
  styleUrl: './supervisor-sidebar.component.css'
})
export class SupervisorSidebarComponent {
  constructor(private service: AuthService, private dialog: MatDialog,
    private blockService: BlockService) { }

  selectedStudent: any;
  supervisorId: any;

  ngOnInit(): void {
    this.supervisorId = this.service.getCurrentUserId();
    console.log("ID: " + this.supervisorId);
  }
}
