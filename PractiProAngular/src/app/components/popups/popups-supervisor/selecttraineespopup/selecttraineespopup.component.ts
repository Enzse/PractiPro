import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../../../filter.pipe';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HirestudentspopupComponent } from '../hirestudentspopup/hirestudentspopup.component';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

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
  selectionForm: FormGroup;
  changeDetected: any;

  constructor(private router: Router, private builder: FormBuilder, private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SelecttraineespopupComponent>, private dialog2: MatDialog, private sanitizer: DomSanitizer) {
    this.changeDetected = [false];
    this.selectionForm = this.builder.group({
      student_id: [''],
      supervisor_id: ['']
    });
  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData() {
    this.service.getStudentsByCompany(this.data.company_id).subscribe((res: any) => {
      this.traineesList = res.payload.map((user: any) => {
        return { ...user, avatar: '' };
      });
      this.traineesList.forEach((student: any) => {
        this.service.getAvatar(student.id).subscribe((res: any) => {
          if (res.size > 0) {
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

  addStudentToSelection(id: number) {
    this.selectionForm.patchValue({
      student_id: id,
      supervisor_id: this.data.supervisor_id
    });
    this.service.addStudentToSupervisor(this.selectionForm.value).subscribe((res: any) => {
      this.changeDetected = true;
      this.dialog.close(this.changeDetected);
    }, error => {
      if (error.status === 409) {
        Swal.fire({
          title: "That student is already in your selection.",
          icon: "warning"
        });
      }
      else {
        Swal.fire({
          title: "Error",
          text: "Failed to add student to company.",
          icon: "error"
        });
      }
    });
  }


}
