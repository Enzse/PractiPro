import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { SessionService } from '../../../services/session.service';
import { StudentService } from '../../../services/api/student.service';
import { CompanyService } from '../../../services/api/company.service';
import { MediaService } from '../../../services/api/media.service';
import { Supervisor } from '../../../models/company';

@Component({
    selector: 'app-supervisor-hirestudents',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './supervisor-hirestudents.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./supervisor-hirestudents.component.css']
})
export class SupervisorHirestudentsComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly companyApi = inject(CompanyService);
  private readonly mediaApi = inject(MediaService);
    searchtext: any;
    matchingStudent: any;
    user: Supervisor | undefined;
    userID: number;
    existingConfirmations: number | undefined;
    searchForm: FormGroup;
    companyForm: FormGroup;

    constructor(
        private builder: NonNullableFormBuilder,
        private sanitizer: DomSanitizer
    ) {
        this.userID = this.session.requireUserId();
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
        this.companyApi.supervisor(this.userID).subscribe((res) => {
            this.user = res.payload[0];
            this.companyForm.patchValue({
                supervisor_id: this.user.id,
                company_id: this.user.company_id,
            });
        });
    }

    searchForStudentID() {
        if (this.searchForm.valid) {
            this.studentApi.byStudentNumber(this.searchForm.value.studentId).subscribe((res) => {
                if (res.payload.length === 0) {
                    Swal.fire({
                        title: "No student found for this student ID.",
                        text: 'Try rechecking if you entered the correct ID or try another ID.',
                    });
                } else {
                    this.matchingStudent = res.payload[0];
                    this.matchingStudent.avatar = '';
                    this.mediaApi.avatar(this.matchingStudent.id).subscribe((avatarRes: any) => {
                        if (avatarRes.size > 0) {
                            const url = URL.createObjectURL(avatarRes);
                            this.matchingStudent.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
                        }
                    });
                    if (this.user?.company_id) {
                        this.companyApi.assignmentCount('company_hiring_requests', 'company_id', 'student_id', this.user.company_id, this.matchingStudent.id).subscribe((res) => {
                            this.existingConfirmations = res.payload[0].assignment_count;
                        });
                    }
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
            this.companyApi.sendHiringRequest(this.companyForm.value).subscribe((res) => {
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

