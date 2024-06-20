import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationpopupComponent } from '../../popups/popups-coordinator/documentationpopup/documentationpopup.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ClassesStudentpopupComponent } from '../../popups/popups-admin/classes-studentpopup/classes-studentpopup.component';
import { AddclassespopupComponent } from '../../popups/popups-admin/addclassespopup/addclassespopup.component';
import { OrdinalPipe } from '../../../pipes/ordinal.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [AdminNavbarComponent, MatMenuModule, MatTableModule, MatTooltipModule, CommonModule, DocumentationpopupComponent, DocumentationpopupComponent, FormsModule, FilterPipe, OrdinalPipe, NgxPaginationModule],
  templateUrl: './admin-classes.component.html',
  styleUrl: './admin-classes.component.css'
})
export class AdminClassesComponent implements OnInit, OnDestroy {
  constructor(private service: AuthService, private dialog: MatDialog) { }
  datalist: any;
  origlist: any;
  coordinatorName: any;
  private subscriptions = new Subscription();
  searchtext: any;
  p: number = 1; /* starting no. of the list */

  ngOnInit(): void {
    this.Loaduser();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  Loaduser() {
    this.subscriptions.add(
      this.service.getClasses().subscribe(res => {
        this.datalist = res.payload;
        this.origlist = this.datalist;
      }));
  }

  setFilter(filter: string) {
    console.log(filter);
    console.log(this.datalist)
    console.log(this.origlist)
    this.datalist = this.origlist;
    switch (filter) {
      case 'all':
        this.datalist = this.origlist;
        break;
      case 'CCS':
        this.datalist = this.datalist.filter((user: any) => user.department === 'CCS');
        break;
      case 'CEAS':
        this.datalist = this.datalist.filter((user: any) => user.department === 'CEAS');
        break;
      case 'CHTM':
        this.datalist = this.datalist.filter((user: any) => user.department === 'CHTM');
        break;
      case 'CAHS':
        this.datalist = this.datalist.filter((user: any) => user.department === 'CAHS');
        break;
      case 'CBA':
        this.datalist = this.datalist.filter((user: any) => user.department === 'CBA');
        break;
      case '1':
        this.datalist = this.datalist.filter((user: any) => user.year_level === 1);
        break;
      case '2':
        this.datalist = this.datalist.filter((user: any) => user.year_level === 2);
        break;
      case '3':
        this.datalist = this.datalist.filter((user: any) => user.year_level === 3);
        break;
      case '4':
        this.datalist = this.datalist.filter((user: any) => user.year_level === 4);
        break;
      case 'BSCS':
        this.datalist = this.datalist.filter((user: any) => user.course === 'BSCS');
        break;
      case 'BSIT':
        this.datalist = this.datalist.filter((user: any) => user.course === 'BSIT');
        break;
      case 'BSEMC':
        this.datalist = this.datalist.filter((user: any) => user.course === 'BSEMC');
        break;
    }
  }

  viewData(code: any) {
    const popup = this.dialog.open(ClassesStudentpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        usercode: code
      }
    })
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.Loaduser()
      }));

  }

  addClasses() {
    const popup = this.dialog.open(AddclassespopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: 'auto',
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
