import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription, switchMap } from 'rxjs';
import { BlockService } from '../../../../services/block.service';
import { ViewprofilepopupComponent } from '../../../popups/shared/viewprofilepopup/viewprofilepopup.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-invitestudents-by-studentid',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatTooltipModule],
  templateUrl: './invitestudents-by-studentid.component.html',
  styleUrl: './invitestudents-by-studentid.component.css'
})
export class InvitestudentsByStudentidComponent implements OnInit, OnDestroy {
  matchingStudent: any;
  user: any;
  userID = this.service.getCurrentUserId();
  invitations: any;
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
    private sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.blockService.selectedBlock$.subscribe(block => {
        this.currentBlock = block;
        this.loadInvitations();
      })
    );
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
            this.checkExistingInvitationForStudent();
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

  checkExistingInvitationForStudent() {
    this.subscriptions.add(
      this.service.checkExistingClassInvitationForBlock(this.matchingStudent.id, this.currentBlock).subscribe((res: any) => {
        this.existingInvitations = res.payload[0].invitationCount;
      }));
  }

  loadInvitations(): void {
    if (this.currentBlock) {
      this.subscriptions.add(
        this.service.getClassInvitationsForBlock(this.currentBlock).subscribe(
          (res: any) => {
            this.invitations = res.payload;
          },
          error => {
            console.error('Error fetching invitations:', error);
          }
        )
      );
    }
  }

  cancelInvitation(id: any) {
    Swal.fire({
      title: "Are you sure you want to cancel this invitation?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#233876",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.cancelClassInvitationByID(id).subscribe((res: any) => {
            this.loadInvitations();
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
            this.checkExistingInvitationForStudent();
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


  viewProfile(student_id: any) {
    const popup = this.dialog.open(ViewprofilepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "200ms",
      width: "auto",
      data: {
        student_id: student_id
      }
    })
  }

  sendClassInvite(student_id: any) {
    const invitationForm = this.builder.group({
      student_id: [student_id],
      advisor_id: [this.userID],
      class: [this.currentBlock]
    })
    this.subscriptions.add(
      this.service.createClassInvitation(invitationForm.value).subscribe((res: any) => {
        this.loadInvitations();
        this.matchingStudent = null;
        this.searchForm.patchValue({
          studentId: ''
        })
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
            this.loadInvitations();
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
