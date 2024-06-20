import { Component, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { RequirementspopupComponent } from '../../popups/popups-coordinator/requirementspopup/requirementspopup.component';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatTooltipModule, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent, FormsModule, FilterPipe, OrdinalPipe, NgxPaginationModule],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.css'
})
export class AdminStudentsComponent implements OnInit, OnDestroy {
  studentlist: any;
  origlist: any;
  searchtext: any;
  p: number = 1; /* starting no. of the list */
  private subscription = new Subscription();
  constructor(private service: AuthService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.Loaduser();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  Loaduser() {
    this.subscription.add(
      this.service.getStudent().subscribe(res => {
        this.studentlist = res.payload;
        this.origlist = this.studentlist;
        console.log(this.origlist)
      }));
  }

  setFilter(filter: string) {
    this.studentlist = this.origlist;
    switch (filter) {
      case 'all':
        this.studentlist = this.origlist;
        break;
      case '1':
        this.studentlist = this.studentlist.filter((user: any) => user.year === 1);
        break;
      case '2':
        this.studentlist = this.studentlist.filter((user: any) => user.year === 2);
        break;
      case '3':
        this.studentlist = this.studentlist.filter((user: any) => user.year === 3);
        break;
      case '4':
        this.studentlist = this.studentlist.filter((user: any) => user.year === 4);
        break;
      case 'BSCS':
        this.studentlist = this.studentlist.filter((user: any) => user.program === 'BSCS');
        break;
      case 'BSIT':
        this.studentlist = this.studentlist.filter((user: any) => user.program === 'BSIT');
        break;
      case 'BSEMC':
        this.studentlist = this.studentlist.filter((user: any) => user.program === 'BSEMC');
        break;
      case 'classes':
        this.router.navigate(["admin-classes"]);
        break;
    }
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
    this.subscription.add(
      popup.afterClosed().subscribe(res => {
        this.Loaduser()
      }));
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


  viewSubmissions(student: any) {
    const popup = this.dialog.open(RequirementspopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        student: student,
      }
    })
  }

}




