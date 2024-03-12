import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-admins',
  standalone: true,
  imports: [AdminSidebarComponent, AdminNavbarComponent, CommonModule],
  templateUrl: './admin-admins.component.html',
  styleUrl: './admin-admins.component.css'
})
export class AdminAdminsComponent {
  constructor(private service: AuthService){
    this.Loaduser();
  }
  userlist: any;
  dataSource: any;

  Loaduser(){
    this.service.GetAll().subscribe(res => {
      this.userlist = res;
    });
  }

  displayedColumns: string[] = ['id', 'name', 'email', 'isActive', 'action']

}
