import { Component, OnInit, Inject, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { StudentProfileDialogComponent } from '../student-profile-dialog/student-profile-dialog.component';
import Swal from 'sweetalert2';
import { NonNullableFormBuilder } from '@angular/forms';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { Router } from '@angular/router';
import { ClassJoinService } from '../../../../core/api/class-join.service';
import { ClassInvitation } from '../../../../core/models/class';

@Component({
    selector: 'app-sent-invites-dialog',
    imports: [CommonModule],
    templateUrl: './sent-invites-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './sent-invites-dialog.component.css'
})
export class SentInvitesDialogComponent {
  private readonly classJoinApi = inject(ClassJoinService);
  datalist: ClassInvitation[] | undefined;
  currentuser: any;
  isLoading: boolean = true;
  private subscriptions = new Subscription();

  constructor(private router: Router, private changeDetection: DataRefreshService, private builder: NonNullableFormBuilder, private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<SentInvitesDialogComponent>) { }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngOnInit(): void {
    this.loadData();
  }
  closePopup() {
    this.dialogRef.close();
  }

  loadData() {
    this.isLoading = true;
    this.subscriptions.add(
      this.classJoinApi.invitationsForClass(this.data.block).subscribe((res) => {
          this.datalist = res.payload;
          this.isLoading = false;
        },
        (error: any) => {
          this.isLoading = false;
          if (error.status == 404) {
            console.log('No requests found.')
          } else {
            console.error('Error fetching classes:', error);
          }

        }
      ));
  }

  viewProfile(student_id: any) {
    const popup = this.dialog.open(StudentProfileDialogComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "200ms",
      width: "auto",
      data: {
        student_id: student_id
      }
    })
  }

  goToInvites() {
    this.dialogRef.close();
    this.router.navigate(['/coordinator/invite-students/by-student-id'])
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
          this.classJoinApi.cancelInvitation(id).subscribe((res) => {
            this.loadData();
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
