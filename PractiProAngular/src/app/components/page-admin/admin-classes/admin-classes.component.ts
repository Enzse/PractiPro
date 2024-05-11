import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ViewsubmissionsComponent } from '../../page-admin/viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../../page-admin/reviewsubmissions/reviewsubmissions.component';
import { DocumentationpopupComponent } from '../../popups/documentationpopup/documentationpopup.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-classes',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, DocumentationpopupComponent, DocumentationpopupComponent, FormsModule, FilterPipe],
  templateUrl: './admin-classes.component.html',
  styleUrl: './admin-classes.component.css'
})
export class AdminClassesComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.Loaduser();
  }
  Coordinator: any;
  students: any;
  datalist: any;
  dataSource: any;
  searchtext: any;

  Loaduser() {
    this.Coordinator = this.service.getCurrentUserId();
    this.service.getClasses().subscribe(res => {
      this.datalist = res
      // console.log(this.students);
      this.dataSource = new MatTableDataSource(this.datalist);
    });
  }


  closeModal() {
    // Add code to close the modal here
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  Updateuser(code: any) {
    const popup = this.dialog.open(DocumentationpopupComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "50%",
      data: {
        usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    });

  }

  viewSubmissions(code: any) {
    const popup = this.dialog.open(DocumentationpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    });

  }
}
