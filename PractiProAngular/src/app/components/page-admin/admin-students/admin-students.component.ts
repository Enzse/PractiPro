import { Component } from '@angular/core';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ViewsubmissionsComponent } from '../../popups/popups-admin/viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../../popups/popups-admin/reviewsubmissions/reviewsubmissions.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';
import { OrdinalPipe } from '../../../ordinal.pipe';
import { AssignstudentpopupComponent } from '../../popups/popups-admin/assignstudentpopup/assignstudentpopup.component';
import { InspectprofilepopupComponent } from '../../popups/popups-admin/inspectprofilepopup/inspectprofilepopup.component';
import Swal from 'sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent, FormsModule, FilterPipe, OrdinalPipe,NgxPaginationModule],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.css'
})
export class AdminStudentsComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.Loaduser();
  }
  students: any;
  studentlist: any;
  dataSource: any;
  searchtext: any;
  p: number = 1; /* starting no. of the list */

  ngOnInit(): void {

  }

  Loaduser() {
    this.service.getStudent().subscribe(res => {
      this.studentlist = res;
      this.dataSource = new MatTableDataSource(this.studentlist);
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

  closeModal() {
    // Add code to close the modal here
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  updateRqStatus(code: any) {
    const popup = this.dialog.open(ViewsubmissionsComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        usercode: code
      }
    });
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
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
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    });
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

  toggleEvaluation(id: number, currentValue: boolean) {
    Swal.fire({
      title: "Are you sure you want to toggle this student's Practicum status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        const newValue = currentValue ? 0 : 1;
        const requestData = {
          id: id,
          newEvaluation: newValue
        };

        this.service.toggleStudentEvaluation(requestData).subscribe(
          (response) => {



            console.log('Evaluation toggled successfully:', response);
            const studentIndex = this.studentlist.findIndex((student: any) => student.id === id);
            if (studentIndex !== -1) {
              this.studentlist[studentIndex].evaluation = newValue;
            }
          },
          (error) => console.error('Error toggling evaluation:', error)
        );
        Swal.fire({
          title: "Confirmed",
          text: "This student's Practicum Status has been evaluated.",
          icon: "success"
        });
      }
    });

  }


}

