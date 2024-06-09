import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationpopupComponent } from '../../popups/popups-coordinator/documentationpopup/documentationpopup.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ClassesStudentpopupComponent } from '../../popups/popups-admin/classes-studentpopup/classes-studentpopup.component';
import { AddclassespopupComponent } from '../../popups/popups-admin/addclassespopup/addclassespopup.component';
import { OrdinalPipe } from '../../../ordinal.pipe';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, DocumentationpopupComponent, DocumentationpopupComponent, FormsModule, FilterPipe, OrdinalPipe, NgxPaginationModule],
  templateUrl: './admin-classes.component.html',
  styleUrl: './admin-classes.component.css'
})
export class AdminClassesComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.Loaduser();
  }
  classes: any;
  datalist: any;
  coordinatorName: any;
  dataSource: any;
  searchtext: any;
  p: number = 1; /* starting no. of the list */

  Loaduser() {
    this.classes = this.service.getCurrentUserId();
    this.service.getClasses().subscribe(res => {
      this.datalist = res;
      this.service.getAdvisors(this.datalist.coordinator_id).subscribe(res =>{
        // this.datalist[0].coordinator_id = `${res[0].first_name} ${res[0].last_name}`;
      })
    });
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
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    });

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
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    });

  }

}
