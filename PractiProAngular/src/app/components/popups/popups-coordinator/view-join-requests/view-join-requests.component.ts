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

@Component({
  selector: 'app-view-join-requests',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './view-join-requests.component.html',
  styleUrl: './view-join-requests.component.css'
})
export class ViewJoinRequestsComponent implements OnInit, OnDestroy {
  datalist: any;
  currentuser: any;
  isLoading: boolean = true;
  private subscriptions = new Subscription();

  constructor(private changeDetection: ChangeDetectionService, private builder: FormBuilder, private service: AuthService, private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ViewJoinRequestsComponent>) { }


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
      this.service.getClassJoinRequestsAdvisor(this.data.block).subscribe(
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

  approveRequest(request: any) {
    const invitationData = this.builder.group({
      block_name: [request.class]
    })
    this.subscriptions.add(
      this.service.assignClassToStudent(request.student_id, invitationData.value).subscribe((res: any) => {
        this.datalist = this.datalist.filter((requests: any) => requests.id !== request.id);
        this.changeDetection.notifyChange(true);
        Swal.fire({
          toast: true,
          position: "top-end",
          backdrop: false,
          title: `Successfully accepted ${request.studentFirstName} ${request.studentLastName} to ${request.class}.`,
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      })
    )
  }

  rejectRequest(requestId: number) {
    Swal.fire({
      title: "Are you sure you want to reject this join request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#233876",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.rejectClassJoinRequest(requestId).subscribe((res: any) => {
            this.datalist = this.datalist.filter((request: any) => request.id !== requestId);
            this.changeDetection.notifyChange(true);
            Swal.fire({
              toast: true,
              position: "top-end",
              backdrop: false,
              title: `Successfully removed request.`,
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

