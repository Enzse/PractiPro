import { Component, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { EditUserDialogComponent } from '../dialogs/edit-user-dialog/edit-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionService } from '../../../core/auth/session.service';
import { UserService } from '../../../core/api/user.service';
import { Role } from '../../../core/models/user';


@Component({
    selector: 'app-admin-admins',
    imports: [CommonModule, MatButtonModule, MatMenuModule, MatTooltipModule, FormsModule, FilterPipe, NgxPaginationModule],
    templateUrl: './admin-admins.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './admin-admins.component.css'
})
export class AdminAdminsComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly userApi = inject(UserService);
  userlist: any;
  origlist:any;
  searchtext: any;
  userId:number;
  userrole: Role | null | undefined;
  private subscriptions = new Subscription();
  p: number = 1; /* starting no. of the list */
  constructor(private dialog: MatDialog) {
    this.userId = this.session.requireUserId();
  }
  
  ngOnInit(): void {
    this.loadUsers();
    this.userrole = this.session.role();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  loadUsers() {
    this.subscriptions.add(
      this.userApi.admins().subscribe((res:any) => {
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
    const popup = this.dialog.open(EditUserDialogComponent, {
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
    const currentUserRole = this.session.role();
    return (currentUserRole === 'superadmin' && userRole !== 'superadmin') || (currentUserRole === 'admin' && userRole !== 'admin' && userRole !== 'superadmin');
  }

}
