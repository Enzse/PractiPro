import { Component } from '@angular/core';
import { CoordNavbarComponent } from '../coord-navbar/coord-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ViewsubmissionsComponent } from '../../page-admin/viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../../page-admin/reviewsubmissions/reviewsubmissions.component';

@Component({
  selector: 'app-coord-accomplishment-report',
  standalone: true,
  imports: [CoordNavbarComponent, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent],
  templateUrl: './coord-accomplishment-report.component.html',
  styleUrl: './coord-accomplishment-report.component.css'
})
export class CoordAccomplishmentReportComponent {

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
