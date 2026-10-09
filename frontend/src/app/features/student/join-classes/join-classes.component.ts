import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { NonNullableFormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ClassInvitationsDialogComponent } from '../dialogs/class-invitations-dialog/class-invitations-dialog.component';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { ClassService } from '../../../core/api/class.service';
import { ClassJoinService } from '../../../core/api/class-join.service';
import { ClassProfile } from '../../../core/models/class';

@Component({
    selector: 'app-join-classes',
    imports: [CommonModule, FilterPipe, FormsModule],
    templateUrl: './join-classes.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./join-classes.component.css'] // Corrected to styleUrls
})
export class JoinClassesComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly classApi = inject(ClassService);
  private readonly classJoinApi = inject(ClassJoinService);
  userId: number;
  student: any;
  classeslist: ClassProfile[] | undefined;
  searchtext: any;
  existingRequest: any;
  invitationCount: any;
  joinRequest: FormGroup;
  private subscriptions = new Subscription();

  constructor(private router: Router, private changeDetection: DataRefreshService, private builder: NonNullableFormBuilder, private dialog: MatDialog) {
    this.userId = this.session.requireUserId();

    this.joinRequest = this.builder.group({
      student_id: [this.userId],
      class: [''],
    });
  }

  ngOnInit(): void {
    this.loadExistingRequest();
    this.getInvitationsCount();

    this.subscriptions.add(
      this.studentApi.ojtStatus(this.userId).pipe(
        map((res: any) => res.payload[0])
      ).subscribe((student: any) => {
        this.student = student;
        if (student.block) {
          this.router.navigate(['/student/dashboard']);
        }
        this.loadClasses();
      }));

    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.getInvitationsCount();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadExistingRequest() {
    this.subscriptions.add(
      this.classJoinApi.requestsOfStudent(this.userId).pipe(
        map((res: any) => res.payload[0])
      ).subscribe((request: any) => {
        this.existingRequest = request;
      }));
  }
  loadClasses(): void {
    if (this.student) {
      this.subscriptions.add(
        this.classApi.byCourseAndYear(this.student.program, this.student.year).subscribe((res) => {
          this.classeslist = res.payload;
        }));
    }
  }
  getInvitationsCount() {
    this.subscriptions.add(
      this.classJoinApi.invitationCountOfStudent(this.userId).pipe(
        map((res: any) => res.payload[0].invitationCount)
      ).subscribe((count: any) => {
        this.invitationCount = count;
      }));
  }

  requestToJoin(block: string) {
    if (this.invitationCount) {
      Swal.fire({
        title: 'You have an Invitation!',
        text: 'It is advisable to check your unread class invitations first before issuing a request.',
        icon: 'warning'
      });
    }
    else {
      this.joinRequest.patchValue({
        class: block
      });

      if (this.joinRequest.valid) {
        this.subscriptions.add(
          this.classJoinApi.requestToJoin(this.joinRequest.value).subscribe((res) => {
            Swal.fire({
              title: 'Request to Join Sent!',
              text: 'Please wait for the class coordinator to accept you into the class',
              icon: 'success',
            });
            this.loadExistingRequest();
          }, error => {
            if (error.status === 409) {
              Swal.fire({
                title: 'Request Pending',
                text: 'You already have a pending request for joining a class.'
              });
            }
          })
        );
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Invalid Data',
          icon: 'error'
        });
      }
    }
  }


  viewInvitations() {
    const popup = this.dialog.open(ClassInvitationsDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "auto",
      data: {
        userId: this.userId
      }
    })
  }

  cancelRequest() {
    Swal.fire({
      title: "Are you sure you want to cancel this join request?",
      text: "You will be taken back to the class selection.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#233876",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.classJoinApi.cancelRequest(this.existingRequest.student_id).subscribe((res) => {
            this.existingRequest = null;
            Swal.fire({
              toast: true,
              position: "top-end",
              backdrop: false,
              title: `Successfully cancelled request.`,
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
