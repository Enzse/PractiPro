import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SessionService } from '../../../services/session.service';
import { SidebarService } from '../../../services/sidebar.service';

@Component({
    selector: 'app-supervisor-sidebar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './supervisor-sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './supervisor-sidebar.component.css'
})
export class SupervisorSidebarComponent {
  protected readonly sidebarState = inject(SidebarService);
  private readonly session = inject(SessionService);
  constructor() { }

  selectedStudent: any;
  supervisorId: number | undefined;

  ngOnInit(): void {
    this.supervisorId = this.session.requireUserId();
    console.log("ID: " + this.supervisorId);
  }
  
}
