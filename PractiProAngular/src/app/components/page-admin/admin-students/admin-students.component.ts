import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { UpdatepopupComponent } from '../updatepopup/updatepopup.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ViewsubmissionsComponent } from '../viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../reviewsubmissions/reviewsubmissions.component';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.css'
})
export class AdminStudentsComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.Loaduser();
  }
  students:any;
  ngOnInit(): void {
    // initFlowbite();
    // this.service.getAllStudents().subscribe(res => {
    //   this.students = res;
    //   console.log(this.students);
    // });
   }
  studentlist: any;
  dataSource: any;

  Loaduser() {
    this.service.getAllStudents().subscribe(res => {
      this.studentlist = res;
      console.log(this.students);
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
        this.Loaduser()      
    });

  }  

  viewSubmissions(code: any) {
    const popup = this.dialog.open(ReviewsubmissionsComponent, {
      enterAnimationDuration: "1000ms",
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

