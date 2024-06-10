import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-supervisor-hirestudents',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './supervisor-hirestudents.component.html',
    styleUrls: ['./supervisor-hirestudents.component.css']
})
export class SupervisorHirestudentsComponent implements OnInit {
    searchtext: any;
    matchingStudent: any;
    user: any;
    userID: any;
    existingConfirmations: any;
    searchForm: FormGroup;
    companyForm: FormGroup;

    constructor(
        private service: AuthService,
        private builder: FormBuilder,
        private sanitizer: DomSanitizer
    ) {
        this.userID = this.service.getCurrentUserId();
        this.searchForm = this.builder.group({
            studentId: ['', Validators.required]
        });

        this.companyForm = this.builder.group({
            company_id: ['', Validators.required],
            student_id: ['', Validators.required],
            supervisor_id: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.service.getSupervisors(this.userID).subscribe((res: any) => {
            this.user = res.payload[0];
            this.companyForm.patchValue({
                supervisor_id: this.user.id,
                company_id: this.user.company_id,
            });
        });
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
                        console.log(this.existingConfirmations)
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
        this.companyForm.patchValue({
            student_id: student.id,
        });
        if (this.companyForm.valid) {
            this.service.createHiringRequest(this.companyForm.value).subscribe((res: any) => {
                Swal.fire({
                    title: "Invitation Sent",
                    text: "Please wait until the student confirms it in their inbox.",
                    icon: "success"
                });
                this.matchingStudent = '';
            }, error => {
                Swal.fire({
                    title: "Error",
                    text: "Failed to add student to company.",
                    icon: "error"
                });
            });
        } else {
            Swal.fire({
                title: "Error",
                text: "Form is invalid.",
                icon: "error"
            });
        }
    }
}

