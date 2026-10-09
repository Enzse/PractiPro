import { Component, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';

import { OnInit } from '@angular/core';
import { EditUserDialogComponent } from '../dialogs/edit-user-dialog/edit-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { DepartmentDialogComponent } from '../dialogs/department-dialog/department-dialog.component';
import { AssignCoordinatorDialogComponent } from '../dialogs/assign-coordinator-dialog/assign-coordinator-dialog.component';
import { CoordinatorClassesDialogComponent } from '../dialogs/coordinator-classes-dialog/coordinator-classes-dialog.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ClassService } from '../../../core/api/class.service';

@Component({
    selector: 'app-admin-coordinators',
    imports: [MatButtonModule, MatMenuModule, MatTooltipModule, FormsModule, FilterPipe, NgxPaginationModule],
    templateUrl: './admin-coordinators.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './admin-coordinators.component.css'
})
export class AdminCoordinatorsComponent implements OnInit, OnDestroy {
  private readonly classApi = inject(ClassService);
  userlist: any[] = [];
  origlist: any;
  searchtext: any;
  private subscriptions = new Subscription();
  p: number = 1; /* starting no. of the list */
  constructor(private dialog: MatDialog) {

  }
  ngOnInit(): void {
    this.Loaduser();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  Loaduser() {
    this.subscriptions.add(
    this.classApi.coordinators().subscribe(res => {
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
        this.userlist = this.userlist.filter((user) => user.department === 'CCS');
        break;
      case 'CEAS':
        this.userlist = this.userlist.filter((user) => user.department === 'CEAS');
        break;
      case 'CHTM':
        this.userlist = this.userlist.filter((user) => user.department === 'CHTM');
        break;
      case 'CAHS':
        this.userlist = this.userlist.filter((user) => user.department === 'CAHS');
        break;
      case 'CBA':
        this.userlist = this.userlist.filter((user) => user.department === 'CBA');
        break;
    }
  }

  closeModal() {
    // Add code to close the modal here
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  Updateuser(code: any) {
    const popup = this.dialog.open(EditUserDialogComponent, {
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
    const popup = this.dialog.open(CoordinatorClassesDialogComponent, {
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
    const popup = this.dialog.open(DepartmentDialogComponent, {
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
    const popup = this.dialog.open(AssignCoordinatorDialogComponent, {
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
