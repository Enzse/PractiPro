import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../../../filter.pipe';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HirestudentspopupComponent } from '../hirestudentspopup/hirestudentspopup.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-selecttraineespopup',
  standalone: true,
  imports: [CommonModule, FilterPipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './selecttraineespopup.component.html',
  styleUrl: './selecttraineespopup.component.css'
})
export class SelecttraineespopupComponent implements OnInit {
  traineesList: any;
  searchtext: any;
  constructor(private router: Router, private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SelecttraineespopupComponent>, private dialog2: MatDialog, private sanitizer: DomSanitizer) {

  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData() {
    console.log(`company ID: ${this.data.company_id}`)
    this.service.getStudentsByCompany(this.data.company_id).subscribe((res: any) => {
      this.traineesList = res.payload.map((user: any) => {
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

  hireStudents() {
    this.router.navigate(['supervisor-hirestudents']);
    this.dialog.close();
  }

  addStudentToSelection() {
    
  }
}
