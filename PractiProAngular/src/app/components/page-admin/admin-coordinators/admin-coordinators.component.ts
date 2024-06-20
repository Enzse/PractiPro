import { Component, OnDestroy } from '@angular/core';
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
import { FilterPipe } from '../../../pipes/filter.pipe';
import { DeptpopupComponent } from '../../popups/popups-admin/deptpopup/deptpopup.component';
import { AssigncoordpopupComponent } from '../../popups/popups-admin/assigncoordpopup/assigncoordpopup.component';
import { CheckclassesComponent } from '../../popups/popups-admin/checkclasses/checkclasses.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-coordinators',
  standalone: true,
  imports: [AdminSidebarComponent, MatButtonModule, MatMenuModule, MatTooltipModule, AdminNavbarComponent, CommonModule, UpdatepopupComponent, FormsModule, FilterPipe, CheckclassesComponent, NgxPaginationModule],
  templateUrl: './admin-coordinators.component.html',
  styleUrl: './admin-coordinators.component.css'
})
export class AdminCoordinatorsComponent implements OnInit, OnDestroy {
  userlist: any[] = [];
  origlist: any;
  searchtext: any;
  private subscriptions = new Subscription();
  p: number = 1; /* starting no. of the list */
  constructor(private service: AuthService, private dialog: MatDialog) {

  }
  ngOnInit(): void {
    this.Loaduser();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  Loaduser() {
    this.subscriptions.add(
    this.service.getAdvisors().subscribe(res => {
      this.userlist = res.payload;
      this.origlist = this.userlist;
    }));
  }

  setFilter(filter: string) {
    console.log(filter);
    console.log(this.userlist)
    console.log(this.origlist)
    this.userlist = this.origlist;
    switch (filter) {
      case 'all':
        this.userlist = this.origlist;
        break;
      case 'CCS':
        this.userlist = this.userlist.filter((user: any) => user.department === 'CCS');
        break;
      case 'CEAS':
        this.userlist = this.userlist.filter((user: any) => user.department === 'CEAS');
        break;
      case 'CHTM':
        this.userlist = this.userlist.filter((user: any) => user.department === 'CHTM');
        break;
      case 'CAHS':
        this.userlist = this.userlist.filter((user: any) => user.department === 'CAHS');
        break;
      case 'CBA':
        this.userlist = this.userlist.filter((user: any) => user.department === 'CBA');
        break;
    }
  }

  closeModal() {
    // Add code to close the modal here
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  Updateuser(code: any) {
    const popup = this.dialog.open(UpdatepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: "50%",
      data: {
        usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    });

  }

  checkClassesPopup(code: any) {
    const popup = this.dialog.open(CheckclassesComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: "80%",
      data: {
        usercode: code
      }
    })
    this.subscriptions.add(
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    }));

  }

  deptPopup(code: any) {
    const popup = this.dialog.open(DeptpopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: "auto",
      data: {
        usercode: code
      }
    })
    this.subscriptions.add(
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    }));

  }


  assignCoordinators() {
    const popup = this.dialog.open(AssigncoordpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        // usercode: code
      }
    })
    this.subscriptions.add(
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    }));

  }


}
