import { Component } from '@angular/core';
import { CoordNavbarComponent } from '../coord-navbar/coord-navbar.component';
import { CoordSidebarComponent } from '../coord-sidebar/coord-sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-coord-classes',
  standalone: true,
  imports: [CoordSidebarComponent, CoordNavbarComponent, CommonModule],
  templateUrl: './coord-classes.component.html',
  styleUrl: './coord-classes.component.css'
})
export class CoordClassesComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.Loaduser();
  }
  ngOnInit(): void {
    initFlowbite();
  }
  userlist: any;
  dataSource: any;

  Loaduser() {
    this.service.getAllAdmins().subscribe(res => {
      this.userlist = res;
      this.dataSource = new MatTableDataSource(this.userlist);
    });
  }

  displayedColumns: string[] = [
    'id',
    'firstName',
    'lastName',
    'studentId',
    'phoneNumber',
    'program',
    'block',
    'year',
    'email',
    'isActive',
    'role',
    'action'];

  closeModal() {
    // Add code to close the modal here
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  // Updateuser(code: any) {
  //   const popup = this.dialog.open(UpdatepopupComponent, {
  //     enterAnimationDuration: "350ms",
  //     exitAnimationDuration: "300ms",
  //     width: "50%",
  //     data: {
  //       usercode: code
  //     }
  //   })
  //   popup.afterClosed().subscribe(res => {
  //     this.Loaduser()
  //   });

  // }
}
