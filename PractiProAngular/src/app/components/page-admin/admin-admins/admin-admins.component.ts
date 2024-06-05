import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { UpdatepopupComponent } from '../../popups/popups-admin/updatepopup/updatepopup.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';


@Component({
  selector: 'app-admin-admins',
  standalone: true,
  imports: [AdminSidebarComponent, AdminNavbarComponent, CommonModule, UpdatepopupComponent, FormsModule, FilterPipe],
  templateUrl: './admin-admins.component.html',
  styleUrl: './admin-admins.component.css'
})
export class AdminAdminsComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog) {
  }
  
  ngOnInit(): void {
    this.loadUsers();
    this.userrole = this.service.GetUserRole();
  }
  userlist: any;
  searchtext: any;
  userrole: any;

  loadUsers() {
    const currentUserId = this.service.getCurrentUserId();
    if (currentUserId !== null) {
      this.service.getAllAdmins().subscribe((res:any) => {
        this.userlist = res.payload.filter((user:any) => user.id !== currentUserId);
        console.log(this.userlist);
      });
    }
  }


  closeModal() {
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  Updateuser(code: any) {
    const popup = this.dialog.open(UpdatepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: "50%",
      data: {
        usercode: code,
        userrole: this.userrole
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadUsers()
    });

  }

  isUpdateButtonVisible(userRole: string): boolean {
    const currentUserRole = this.service.GetUserRole();
    return (currentUserRole === 'superadmin' && userRole !== 'superadmin') || (currentUserRole === 'admin' && userRole !== 'admin' && userRole !== 'superadmin');
  }

}
