import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { UpdatepopupComponent } from '../updatepopup/updatepopup.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [AdminSidebarComponent, AdminNavbarComponent, CommonModule, UpdatepopupComponent, FormsModule, FilterPipe, NgxPaginationModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog) {
  }

  searchtext: any; //FOR SEARCH FILTER
  userlist: any; //ARRAY OF ALL USERS FETCHED FROM DATABASE
  userrole: any; //ROLE OF USER THE IS LOGGED IN (to check if admin / superadmin)
  p: number = 1; /* starting no. of the list */


  //This block executes upon opening this page:
  ngOnInit(): void {
    this.loadUsers();
    this.userrole = this.service.GetUserRole();
  }

  //This block fetches ALL users from the database:
  loadUsers() {
    const currentUserId = this.service.getCurrentUserId();
    if (currentUserId !== null) {
      this.service.getAllUsers().subscribe((res: any) => {
        //The "res" variable automatically contains an object that contains the payload(payload = fetched data).
        this.userlist = res.payload.filter((user: any) => user.id !== currentUserId);
        this.userlist = res.payload.filter((user: any) => user.role !== "admin" && user.role !== "superadmin");
        console.log(this.userlist);
      });
    }
  }

  //"Update" button functionality:
  Updateuser(code: any) {
    const popup = this.dialog.open(UpdatepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: "80%",
      data: {
        usercode: code,
        userrole: this.userrole
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadUsers()
    });
  }

  //"Update" button restriction
  isUpdateButtonVisible(userRole: string): boolean {
    const currentUserRole = this.service.GetUserRole();
    return (currentUserRole === 'superadmin' && userRole !== 'superadmin') || (currentUserRole === 'admin' && userRole !== 'admin' && userRole !== 'superadmin');
  }

  //"Update" button restriction
  handleDisabledClick() {
    Swal.fire({
      title: "Super Admin Only!",
      text: "This function is only available for users with the Super Admin role.",
      icon: "error"
    })
  }

}