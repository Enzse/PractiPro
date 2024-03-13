import { Component } from '@angular/core';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { UpdatepopupComponent } from '../updatepopup/updatepopup.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.css'
})
export class AdminStudentsComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.Loaduser();
  }
  students:any;
  ngOnInit(): void {
    initFlowbite();
    this.service.getAllStudents().subscribe(res => {
      this.students = res;
      console.log(this.students);
    });
   }
  studentlist: any;
  dataSource: any;

  Loaduser() {
    this.service.getAllStudents().subscribe(res => {
      this.studentlist = res;
      this.dataSource = new MatTableDataSource(this.studentlist);
    });
  }

  // displayedColumns: string[] = [
  //   'id',
  //   'firstName',
  //   'lastName',
  //   'studentId',
  //   'phoneNumber',
  //   'program',
  //   'block',
  //   'year',
  //   'email',
  //   'isActive',
  //   'role',
  //   'action'];

  closeModal() {
    // Add code to close the modal here
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  Updateuser(code: any) {
    const popup = this.dialog.open(UpdatepopupComponent, {
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

}

