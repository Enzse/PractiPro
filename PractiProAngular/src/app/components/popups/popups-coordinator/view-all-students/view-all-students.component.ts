import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { ViewprofilepopupComponent } from '../../shared/viewprofilepopup/viewprofilepopup.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-all-students',
  standalone: true,
  imports: [CommonModule, FilterPipe, FormsModule, RouterLink, RouterLinkActive, MatButtonModule, MatMenuModule],
  templateUrl: './view-all-students.component.html',
  styleUrl: './view-all-students.component.css'
})
export class ViewAllStudentsComponent implements OnInit, OnDestroy {
  studentList: any;
  searchtext: any;
  private subscriptions = new Subscription();
  conditionDisplay: any;

  constructor(private router: Router, private builder: FormBuilder, private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewAllStudentsComponent>, private dialog2: MatDialog, private sanitizer: DomSanitizer, private changeDetection: ChangeDetectionService) {

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData() {
    this.subscriptions.add(
      this.service.getAllStudentsFromClass(this.data.block).subscribe((res: any) => {
        this.studentList = res.payload.map((user: any) => {
          return { ...user, avatar: '' };
        });

        if (this.data.condition) {
          // this.studentList.filter((student: any) => student.)
          switch (this.data.condition) {
            case 'registered':
              this.studentList = this.studentList.filter((student: any) => student.registration_status === 1);
              this.conditionDisplay = 'Cleared Registration Status'
              break;
            case 'ojtsite':
              this.studentList = this.studentList.filter((student: any) => student.company_id !== null);
              this.conditionDisplay = 'Has OJT Site'
              break;
            case 'onsitehours':
              this.studentList = this.studentList.filter((student: any) => student.TotalHoursWorked >= 200);
              this.conditionDisplay = '200+ On-site Hours'
              break;
            case 'seminarhours':
              this.studentList = this.studentList.filter((student: any) => student.TotalSeminarHours >= 50);
              this.conditionDisplay = '50+ Seminar Hours'
              break;
            case 'evaluation':
              this.studentList = this.studentList.filter((student: any) => student.evaluation_status === 'Completed!');
              this.conditionDisplay = 'Cleared Performance Evaluation'
              break;
            case 'exitpoll':
              this.studentList = this.studentList.filter((student: any) => student.exitpoll_status === 'Completed!');
              this.conditionDisplay = 'Cleared Exit Poll'
              break;
          }
        }

        this.studentList.forEach((student: any) => {
          this.subscriptions.add(
            this.service.getAvatar(student.id).subscribe((res: any) => {
              if (res.size > 0) {
                const url = URL.createObjectURL(res);
                student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
              }
            }))
        });
      }))
  }

  inviteStudents() {
    this.router.navigate(['advisor-invitestudents']);
    this.dialog.close();
  }


  option1Action(id: number, firstName: string, lastName: string) {
    Swal.fire({
      title: "Request Confirmation",
      text: `Are you sure you want to remove ${firstName} ${lastName} from your company?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#20284a",
      confirmButtonText: "Remove student"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.removeStudentFromCompany(this.data.company_id, id).subscribe((res: any) => {
            this.changeDetection.notifyChange(true);
            Swal.fire({
              title: "Student Removed!",
              text: "The student has been successfully removed from your company.",
              icon: "success"
            });
          }, error => {
            Swal.fire({
              title: "Request failed",
              text: "You may not have permission to remove this user.",
              icon: "error"
            });
          }));
        this.dialog.close();
      }
    });
  }


  viewProfile(student_id: any) {
    const popup = this.dialog2.open(ViewprofilepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "200ms",
      width: "auto",
      data: {
        student_id: student_id
      }
    })
  }
}
