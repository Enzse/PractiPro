import { Component, OnInit, Inject, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { StudentProfileDialogComponent } from '../student-profile-dialog/student-profile-dialog.component';
import Swal from 'sweetalert2';
import { NonNullableFormBuilder } from '@angular/forms';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { StudentService } from '../../../../core/api/student.service';
import { ClassJoinService } from '../../../../core/api/class-join.service';

@Component({
    selector: 'app-join-requests-dialog',
    imports: [CommonModule, MatTooltipModule],
    templateUrl: './join-requests-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './join-requests-dialog.component.css'
})
export class JoinRequestsDialogComponent implements OnInit, OnDestroy {
  private readonly studentApi = inject(StudentService);
  private readonly classJoinApi = inject(ClassJoinService);
  datalist: any;
  currentuser: any;
  isLoading: boolean = true;
  private subscriptions = new Subscription();

  constructor(private changeDetection: DataRefreshService, private builder: NonNullableFormBuilder, private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<JoinRequestsDialogComponent>) { }


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
      this.classJoinApi.requestsForClass(this.data.block).subscribe((res) => {
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

  approveRequest(request: any) {
    const invitationData = this.builder.group({
      block_name: [request.class]
    })
    this.subscriptions.add(
      this.studentApi.joinClass(request.student_id, invitationData.getRawValue()).subscribe((res) => {
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
          this.classJoinApi.rejectRequest(requestId).subscribe((res) => {
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

