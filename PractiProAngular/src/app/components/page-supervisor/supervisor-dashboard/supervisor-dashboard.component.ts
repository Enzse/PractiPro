import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { SelecttraineespopupComponent } from '../../popups/popups-supervisor/selecttraineespopup/selecttraineespopup.component';
import { ViewtraineepopupComponent } from '../../popups/popups-supervisor/viewtraineepopup/viewtraineepopup.component';

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrl: './supervisor-dashboard.component.css'
})
export class SupervisorDashboardComponent {
  userId: any;
  user: any;
  traineesList: any;
  avatarUrl?: SafeUrl;
  searchtext: any;

  constructor(private service: AuthService, private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.service.getCurrentUserId();
    this.service.getSupervisors(this.userId).subscribe((res: any) => {
      this.user = res.payload[0];
    })
  }


  ngOnInit(): void {
    this.loadData();
  }



  loadData() {
    this.service.getStudentsBySupervisor(this.userId).subscribe((res: any) => {
      this.traineesList = res.payload.map((user:any) => {
        return { ...user, avatar: '' };
      });    
      this.traineesList.forEach((student: any) => {
        this.service.getAvatar(student.id).subscribe((res: any) => {
          if (res.size > 0) {
            console.log(res);
            const url = URL.createObjectURL(res);
            student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
          }
        })
      });
    })
  }






  selectTrainees() {
    const popup = this.dialog.open(SelecttraineespopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        company_id: this.user.company_id
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

  viewTrainee(student: any) {
    const popup = this.dialog.open(ViewtraineepopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: 'auto',
      data: {
        student: student
      }
    })
    // popup.afterClosed().subscribe(res => {
    //   this.loadData()
    // });
  }

  removeStudentFromSelection(id: number) {

  }
}
