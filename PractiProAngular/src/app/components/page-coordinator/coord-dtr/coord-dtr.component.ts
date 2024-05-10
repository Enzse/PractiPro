import { Component } from '@angular/core';
import { CoordNavbarComponent } from '../coord-navbar/coord-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ViewsubmissionsComponent } from '../../page-admin/viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../../page-admin/reviewsubmissions/reviewsubmissions.component';
import { DtrpopupcomponentComponent } from '../../popups/dtrpopupcomponent/dtrpopupcomponent.component';

@Component({
  selector: 'app-coord-dtr',
  standalone: true,
  imports: [CoordNavbarComponent, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent],
  templateUrl: './coord-dtr.component.html',
  styleUrl: './coord-dtr.component.css'
})
export class CoordDtrComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.Loaduser();
  }
  Coordinator: any;
  datalist: any;
  dataSource: any;

  Loaduser() {
    this.Coordinator = this.service.getCurrentUserId();
    this.service.getStudentsByCoordinator(this.Coordinator).subscribe(res => {
      this.datalist = res.payload;
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
    const popup = this.dialog.open(DtrpopupcomponentComponent, {
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
    const popup = this.dialog.open(DtrpopupcomponentComponent, {
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
