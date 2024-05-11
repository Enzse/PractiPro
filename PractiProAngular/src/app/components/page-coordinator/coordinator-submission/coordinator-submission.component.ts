import { Component } from '@angular/core';
import { CoordNavbarComponent } from '../coord-navbar/coord-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ViewsubmissionsComponent } from '../../page-admin/viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../../page-admin/reviewsubmissions/reviewsubmissions.component';
import { RequirementspopupComponent } from '../../popups/requirementspopup/requirementspopup.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';


@Component({
  selector: 'app-coordinator-submission',
  standalone: true,
  imports: [CoordNavbarComponent, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent, FormsModule, FilterPipe],
  templateUrl: './coordinator-submission.component.html',
  styleUrl: './coordinator-submission.component.css'
})
export class CoordinatorSubmissionComponent {

  constructor(private service: AuthService, private dialog: MatDialog) {
    this.loadHeldStudents();

  }
  Coordinator: any;
  students: any;
  studentlist: any;
  dataSource: any;
  searchtext: any;

  loadHeldStudents() {
    this.Coordinator = this.service.getCurrentUserId();
    this.service.getStudentsByCoordinator(this.Coordinator).subscribe(res => {
      this.studentlist = res.payload;
      // console.log(this.students);
      this.dataSource = new MatTableDataSource(this.studentlist);
    });
  }


  closeModal() {
    // Add code to close the modal here
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  Updateuser(code: any) {
    const popup = this.dialog.open(ViewsubmissionsComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "50%",
      data: {
        usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadHeldStudents()
    });

  }

  viewSubmissions(code: any) {
    const popup = this.dialog.open(RequirementspopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadHeldStudents()
    });

  }

}
