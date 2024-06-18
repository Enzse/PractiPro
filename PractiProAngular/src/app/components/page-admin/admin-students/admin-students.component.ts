import { Component } from '@angular/core';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewsubmissionsComponent } from '../../popups/popups-admin/viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../../popups/popups-admin/reviewsubmissions/reviewsubmissions.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { OrdinalPipe } from '../../../pipes/ordinal.pipe';
import { AssignstudentpopupComponent } from '../../popups/popups-admin/assignstudentpopup/assignstudentpopup.component';
import { InspectprofilepopupComponent } from '../../popups/popups-admin/inspectprofilepopup/inspectprofilepopup.component';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent, FormsModule, FilterPipe, OrdinalPipe, NgxPaginationModule],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.css'
})
export class AdminStudentsComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog) {}
  studentlist: any;
  searchtext: any;
  p: number = 1; /* starting no. of the list */

  ngOnInit(): void {
    this.Loaduser();
  }

  Loaduser() {
    this.service.getStudent().subscribe(res => {
      this.studentlist = res.payload;
    });
  }

  assignStudents() {
    const popup = this.dialog.open(AssignstudentpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        // usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    });
  }

  viewRegistrationStatus(code: any) {
    const popup = this.dialog.open(ViewsubmissionsComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "auto",
      data: {
        usercode: code
      }
    });
  }


  viewInfo(code: any, studentID: any) {
    const popup = this.dialog.open(InspectprofilepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: 'auto',
      data: {
        usercode: code,
        studentId: studentID
      }
    })
  }

  viewSubmissions(code: any) {
    const popup = this.dialog.open(ReviewsubmissionsComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        usercode: code
      }
    })
  }

}




