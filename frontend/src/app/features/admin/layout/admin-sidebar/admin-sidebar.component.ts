import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../../../core/layout/sidebar.service';

@Component({
    selector: 'app-admin-sidebar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './admin-sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  protected readonly sidebarState = inject(SidebarService);

}
