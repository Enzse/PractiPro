import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-supervisor-hirestudents',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './supervisor-hirestudents.component.html',
  styleUrl: './supervisor-hirestudents.component.css'
})
export class SupervisorHirestudentsComponent {
  searchtext: any;
  matchingStudent: any;
  constructor(private service: AuthService, private builder: FormBuilder, private sanitizer: DomSanitizer) {

  }


  searchForm = this.builder.group({
    studentId: this.builder.control('', Validators.required)
  });

  searchForStudentID() {
    console.log(this.searchForm.value.studentId);
    if (this.searchForm.valid) {
        this.service.getStudentsByStudentID(this.searchForm.value.studentId).subscribe((res: any) => {
            if (res.payload.length === 0) {
                Swal.fire({
                    title: "No student found for this student ID.",
                    text: 'Try rechecking if you entered the correct ID or try another ID.',
                });
            } else {
                this.matchingStudent = res.payload[0];
                this.matchingStudent.avatar = ''; // Ensure avatar field exists
                
                console.log(this.matchingStudent);
                
                this.service.getAvatar(this.matchingStudent.id).subscribe((avatarRes: any) => {
                    if (avatarRes.size > 0) {
                        const url = URL.createObjectURL(avatarRes);
                        this.matchingStudent.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
                    }
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


  hireStudent(student:any) {

  }
}
