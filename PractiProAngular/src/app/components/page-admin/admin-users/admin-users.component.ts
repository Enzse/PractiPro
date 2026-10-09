import { Component, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { UpdatepopupComponent } from '../../popups/popups-admin/updatepopup/updatepopup.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { SessionService } from '../../../services/session.service';
import { UserService } from '../../../services/api/user.service';

@Component({
    selector: 'app-admin-users',
    imports: [MatMenuModule, MatButtonModule, MatTooltipModule, CommonModule, FormsModule, FilterPipe, NgxPaginationModule],
    templateUrl: './admin-users.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly userApi = inject(UserService);
  private subscription = new Subscription();
  userId: any;
  searchtext: any; //FOR SEARCH FILTER
  userlist: any; //ARRAY OF ALL USERS FETCHED FROM DATABASE
  origlist: any;
  userrole: any; //ROLE OF USER THE IS LOGGED IN (to check if admin / superadmin)
  p: number = 1; /* starting no. of the list */
  constructor(private dialog: MatDialog) {
    this.userId = this.session.userId();
  }



  //This block executes upon opening this page:
  ngOnInit(): void {
    this.loadUsers();
    this.userrole = this.session.role();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  //This block fetches ALL users from the database:
  loadUsers() {
    this.userApi.all().subscribe((res) => {
      //The "res" variable automatically contains an object that contains the payload(payload contains fetched data).
      this.userlist = res.payload
      .filter((user: any) => user.id !== this.userId && user.role !== "admin" && user.role !== "superadmin")
      .sort((a: any, b: any) => b.id - a.id);
    this.origlist = this.userlist;
    });
  }

  setFilter(filter: string) {
    this.userlist = this.origlist;
    switch (filter) {
      case 'all':
        this.userlist = this.origlist;
        break;
      case 'student':
        this.userlist = this.userlist.filter((user: any) => user.role === 'student');
        break;
      case 'advisor':
        this.userlist = this.userlist.filter((user: any) => user.role === 'advisor');
        break;
      case 'supervisor':
        this.userlist = this.userlist.filter((user: any) => user.role === 'supervisor');
        break;
      case 'active':
        this.userlist = this.userlist.filter((user: any) => user.isActive === 1);
        break;
      case 'inactive':
        this.userlist = this.userlist.filter((user: any) => user.isActive === 0);
        break;
      case 'pending':
        this.userlist = this.userlist.filter((user: any) => !user.approved_at);
        break;
    }
  }

  // Self-registered coordinators and supervisors can't log in until approved.
  approveUser(user: any) {
    this.subscription.add(
      this.userApi.approve(user.id).subscribe(() => {
        Swal.fire({ title: `${user.firstName} ${user.lastName} can now log in.`, icon: "success" });
        this.loadUsers();
      }));
  }

  rejectUser(user: any) {
    Swal.fire({
      title: `Reject ${user.firstName} ${user.lastName}?`,
      text: "Their account will be deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject",
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscription.add(
          this.userApi.delete(user.id).subscribe(() => this.loadUsers()));
      }
    });
  }












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
    this.subscription.add(
      popup.afterClosed().subscribe(res => {
        this.loadUsers()
      }));
  }

  //"Update" button restriction
  isUpdateButtonVisible(userRole: string): boolean {
    const currentUserRole = this.session.role();
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