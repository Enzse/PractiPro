import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { Subscription, map } from 'rxjs';
import { BlockService } from '../../../../services/block.service';

@Component({
  selector: 'app-invitestudents-by-studentid',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,],
  templateUrl: './invitestudents-by-studentid.component.html',
  styleUrl: './invitestudents-by-studentid.component.css'
})
export class InvitestudentsByStudentidComponent implements OnInit, OnDestroy {
  matchingStudent: any;
  user: any;
  userID: any;
  existingInvitations: any = 0;
  currentBlock: any;
  searchForm = this.builder.group({
    studentId: ['', Validators.required]
  });
  private subscriptions = new Subscription();

  constructor(
    private blockService: BlockService,
    private service: AuthService,
    private builder: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.userID = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.blockService.selectedBlock$.subscribe(block => {
        this.currentBlock = block;
      }));
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  searchForStudentID() {
    if (this.searchForm.valid) {
      this.subscriptions.add(
        this.service.getStudentsByStudentID(this.searchForm.value.studentId).subscribe((res: any) => {
          if (res.payload.length === 0) {
            Swal.fire({
              title: "No registered student found for this student ID.",
              text: 'Try rechecking if you entered the correct ID or try another ID.',
            });
          } else {
            this.matchingStudent = res.payload[0];
            this.matchingStudent.avatar = '';
            this.subscriptions.add(
              this.service.getAvatar(this.matchingStudent.id).subscribe((avatarRes: any) => {
                if (avatarRes.size > 0) {
                  const url = URL.createObjectURL(avatarRes);
                  this.matchingStudent.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
                }
              }));
            this.subscriptions.add(
              this.service.getClassInvitationCountForBlock(this.matchingStudent.id, this.currentBlock).subscribe((res: any) => {
                this.existingInvitations = res.payload[0].invitationCount;
              }));
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
        }));
    } else {
      Swal.fire({
        title: "Please enter a student ID first.",
        icon: "warning"
      });
    }
  }

  sendClassInvite(student_id: any) {
    const invitationForm = this.builder.group({
      student_id: [student_id],
      advisor_id: [this.userID],
      class: [this.currentBlock]
    })
    this.subscriptions.add(
      this.service.createClassInvitation(invitationForm.value).subscribe((res: any) => {
        this.matchingStudent = null;
        Swal.fire({
          title: "Invitation sent!",
          icon: 'success'
        })
      }))
  }

  cancelClassInvite(student_id: any) {
    Swal.fire({
      title: "Are you sure you want to cancel this invitation?",
      text: "Keep in mind that this is only for scenarios where you are sure that this invitation is a mistake.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#233876",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.cancelClassInvitation(student_id).subscribe((res: any) => {
            this.matchingStudent = null;
            Swal.fire({
              toast: true,
              position: "top-end",
              backdrop: false,
              title: `Successfully cancelled invitation.`,
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          }, error => {
            Swal.fire({
              title: "Delete failed",
              text: "There seemed to be a database error. Please try again later.",
              icon: "error"
            });
          }));
      }
    });
  }
}
