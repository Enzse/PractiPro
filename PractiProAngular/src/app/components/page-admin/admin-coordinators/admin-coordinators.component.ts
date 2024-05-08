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

@Component({
  selector: 'app-admin-coordinators',
  standalone: true,
  imports: [AdminSidebarComponent, AdminNavbarComponent, CommonModule, UpdatepopupComponent],
  templateUrl: './admin-coordinators.component.html',
  styleUrl: './admin-coordinators.component.css'
})
export class AdminCoordinatorsComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.Loaduser();
  }
  ngOnInit(): void {
    initFlowbite();
  }
  userlist: any;
  dataSource: any;

  Loaduser() {
    this.service.getAllCoordinators().subscribe(res => {
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

  Updateuser(code: any) {
    const popup = this.dialog.open(UpdatepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
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
