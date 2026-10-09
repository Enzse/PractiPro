import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-admin-sidebar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './admin-sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {

}
