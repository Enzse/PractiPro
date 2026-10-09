import { Component, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';

import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ViewsubmissionsComponent } from '../../popups/popups-admin/viewsubmissions/viewsubmissions.component';
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
import { StudentService } from '../../../services/api/student.service';

@Component({
    selector: 'app-admin-students',
    imports: [MatButtonModule, MatMenuModule, MatTooltipModule, FormsModule, FilterPipe, OrdinalPipe, NgxPaginationModule],
    templateUrl: './admin-students.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './admin-students.component.css'
})
export class AdminStudentsComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);
  studentlist: any;
  origlist: any;
  searchtext: any;
  p: number = 1; /* starting no. of the list */
  private subscription = new Subscription();
  constructor(private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.Loaduser();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  Loaduser() {
    this.subscription.add(
      this.studentApi.all().subscribe(res => {
        this.studentlist = res.payload.sort((a: any, b: any) => b.id - a.id);
        this.origlist = this.studentlist;
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




