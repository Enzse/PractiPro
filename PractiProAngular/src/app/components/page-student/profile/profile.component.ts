import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditinformationpopupComponent } from '../editinformationpopup/editinformationpopup.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, CommonModule, EditinformationpopupComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  studentProfile: any[] = [];

  constructor(private service: AuthService, private dialog: MatDialog) { }

  userId = this.service.getCurrentUserId();
  ngOnInit(): void {
    this.loadInfo();
  }

  loadInfo() {
    if (this.userId) {
      this.service.getStudentProfile(this.userId).subscribe(
        (data: any[]) => {
          this.studentProfile = data;
          console.log(this.studentProfile)
        },
        (error: any) => {
          console.error('Error fetching student requirements:', error);
        }
      );
    }
  }

  editInfo(code: any) {
    const popup = this.dialog.open(EditinformationpopupComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "50%",
      data: {
        usercode: code
      }
    });
    popup.afterClosed().subscribe(res => {
      this.loadInfo()
    });
  }
}
