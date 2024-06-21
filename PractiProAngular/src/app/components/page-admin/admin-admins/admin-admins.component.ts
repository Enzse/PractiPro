import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { UpdatepopupComponent } from '../../popups/popups-admin/updatepopup/updatepopup.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-admin-admins',
  standalone: true,
  imports: [CommonModule, UpdatepopupComponent, MatButtonModule, MatMenuModule, MatTooltipModule, FormsModule, FilterPipe, NgxPaginationModule],
  templateUrl: './admin-admins.component.html',
  styleUrl: './admin-admins.component.css'
})
export class AdminAdminsComponent implements OnInit, OnDestroy {
  userlist: any;
  origlist:any;
  searchtext: any;
  userId:any;
  userrole: any;
  private subscriptions = new Subscription();
  p: number = 1; /* starting no. of the list */
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.userId = this.service.getCurrentUserId();
  }
  
  ngOnInit(): void {
    this.loadUsers();
    this.userrole = this.service.GetUserRole();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  loadUsers() {
    this.subscriptions.add(
      this.service.getAllAdmins().subscribe((res:any) => {
        this.userlist = res.payload.filter((user:any) => user.id !== this.userId);
        this.origlist = this.userlist;
      }));
  }

  setFilter(filter: string) {
    this.userlist = this.origlist;
    switch (filter) {
      case 'all':
        this.userlist = this.origlist;
        break;
      case 'active':
        this.userlist = this.userlist.filter((user: any) => user.isActive === 1);
        break;
      case 'inactive':
        this.userlist = this.userlist.filter((user: any) => user.isActive === 0);
        break;
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
    this.subscriptions.add(
    popup.afterClosed().subscribe(res => {
      this.loadUsers()
    }));

  }

  isUpdateButtonVisible(userRole: string): boolean {
    const currentUserRole = this.service.GetUserRole();
    return (currentUserRole === 'superadmin' && userRole !== 'superadmin') || (currentUserRole === 'admin' && userRole !== 'admin' && userRole !== 'superadmin');
  }

}
