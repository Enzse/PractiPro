import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ViewprofilepopupComponent } from '../../shared/viewprofilepopup/viewprofilepopup.component';
import Swal from 'sweetalert2';
import { FormBuilder } from '@angular/forms';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-sent-invites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-sent-invites.component.html',
  styleUrl: './view-sent-invites.component.css'
})
export class ViewSentInvitesComponent {
  datalist: any;
  currentuser: any;
  isLoading: boolean = true;
  private subscriptions = new Subscription();

  constructor(private router: Router, private changeDetection: ChangeDetectionService, private builder: FormBuilder, private service: AuthService, private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ViewSentInvitesComponent>) { }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.subscriptions.add(
      this.service.getClassInvitationsForBlock(this.data.block).subscribe(
        (res: any) => {
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
    const popup = this.dialog.open(ViewprofilepopupComponent, {
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
    this.router.navigate(['coord-invitestudents/invite-by-studentid'])
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
