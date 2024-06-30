import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription, map } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import Swal from 'sweetalert2';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-classinvitations',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule],
  templateUrl: './classinvitations.component.html',
  styleUrl: './classinvitations.component.css'
})
export class ClassinvitationsComponent implements OnInit, OnDestroy {
  invitations$ = this.service.getClassInvitations(this.data.userId).pipe(
    map((res: any) => res.payload[0])
  );
  private subscriptions = new Subscription();
  constructor(
    private router: Router,
    private builder: FormBuilder,
    private changeDetection: ChangeDetectionService,
    private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogref: MatDialogRef<ClassinvitationsComponent>) {
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  joinClass(invitation: any) {
    const invitationData = this.builder.group({
      block_name: [invitation.class]
    })
    this.subscriptions.add(
      this.service.assignClassToStudent(invitation.student_id, invitationData.value).subscribe((res: any) => {
        this.dialogref.close();
        this.router.navigate(['student-dashboard']);
        Swal.fire({
          title: `Successfully joined ${invitation.class}!`,
          text: "You are now able with proceed to your registration process.",
          icon: "success"
        });
      })
    )
  }

  cancelInvitation(id: number) {
    Swal.fire({
      title: "Are you sure you want to decline this invitation?",
      text: "Keep in mind that this is only for scenarios where you are sure that this invitation is a mistake.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#233876",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.cancelClassInvitation(id).subscribe((res: any) => {
            Swal.fire({
              toast: true,
              position: "top-end",
              backdrop: false,
              title: `Successfully declined invitation.`,
              icon: "success",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
            this.changeDetection.notifyChange(true);
            this.dialogref.close();
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
