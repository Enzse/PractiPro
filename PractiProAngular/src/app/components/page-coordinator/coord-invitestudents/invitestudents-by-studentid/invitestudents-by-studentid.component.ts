import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-invitestudents-by-studentid',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,],
  templateUrl: './invitestudents-by-studentid.component.html',
  styleUrl: './invitestudents-by-studentid.component.css'
})
export class InvitestudentsByStudentidComponent {
  searchtext: any;
  matchingStudent: any;
  user: any;
  userID: any;
  existingConfirmations: any;
  searchForm = this.builder.group({
    studentId: ['', Validators.required]
  });

  constructor(
    private service: AuthService,
    private builder: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.userID = this.service.getCurrentUserId();
  }

  ngOnInit(): void {

  }

  searchForStudentID() {
    if (this.searchForm.valid) {
      this.service.getStudentsByStudentID(this.searchForm.value.studentId).subscribe((res: any) => {
        if (res.payload.length === 0) {
          Swal.fire({
            title: "No student found for this student ID.",
            text: 'Try rechecking if you entered the correct ID or try another ID.',
          });
        } else {
          this.matchingStudent = res.payload[0];
          this.matchingStudent.avatar = '';
          this.service.getAvatar(this.matchingStudent.id).subscribe((avatarRes: any) => {
            if (avatarRes.size > 0) {
              const url = URL.createObjectURL(avatarRes);
              this.matchingStudent.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
            }
          });


          this.service.checkExistingAssignment('company_hiring_requests', 'company_id', 'student_id', this.user.company_id, this.matchingStudent.id).subscribe((res: any) => {
            this.existingConfirmations = res.payload[0].assignment_count
          });
        }
      }, error => {
        if (error.status === 403) {
          Swal.fire({
            title: "Please enter a valid student ID.",
            icon: "warning"
          });
        } else {
          Swal.fire({
            title: "Server-side error",
            text: 'Please try again another time.',
            icon: "error"
          });
        }
      });
    } else {
      Swal.fire({
        title: "Please enter a student ID first.",
        icon: "warning"
      });
    }
  }

  sendHiringRequest(student: any) {



  }
}
