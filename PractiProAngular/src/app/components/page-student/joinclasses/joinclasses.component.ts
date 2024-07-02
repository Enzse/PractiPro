import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ClassinvitationsComponent } from '../../popups/popups-student/classinvitations/classinvitations.component';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-joinclasses',
  standalone: true,
  imports: [CommonModule, FilterPipe, FormsModule],
  templateUrl: './joinclasses.component.html',
  styleUrls: ['./joinclasses.component.css'] // Corrected to styleUrls
})
export class JoinclassesComponent implements OnInit, OnDestroy {
  userId: any;
  student: any;
  classeslist: any;
  searchtext: any;
  existingRequest: any;
  invitationCount: any;
  joinRequest: FormGroup;
  private subscriptions = new Subscription();

  constructor(private router: Router, private changeDetection: ChangeDetectionService, private builder: FormBuilder, private service: AuthService, private dialog: MatDialog) {
    this.userId = this.service.getCurrentUserId();

    this.joinRequest = this.builder.group({
      student_id: [this.userId],
      class: [''],
    });
  }

  ngOnInit(): void {
    this.loadExistingRequest();
    this.getInvitationsCount();

    this.subscriptions.add(
      this.service.getStudentOjtInfo(this.userId).pipe(
        map((res: any) => res.payload[0])
      ).subscribe((student: any) => {
        this.student = student;
        if (student.block) {
          this.router.navigate(['student-dashboard']);
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
      this.service.getClassJoinRequests(this.userId).pipe(
        map((res: any) => res.payload[0])
      ).subscribe((request: any) => {
        this.existingRequest = request;
      }));
  }
  loadClasses(): void {
    if (this.student) {
      this.subscriptions.add(
        this.service.getClassesByCourseAndYear(this.student.program, this.student.year).subscribe((res: any) => {
          this.classeslist = res.payload;
        }));
    }
  }
  getInvitationsCount() {
    this.subscriptions.add(
      this.service.getClassInvitationCount(this.userId).pipe(
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
          this.service.createClassJoinRequest(this.joinRequest.value).subscribe((res: any) => {
            Swal.fire({
              title: 'Request to Join Sent!',
              text: 'Please wait for the class advisor to accept you into the class',
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
    const popup = this.dialog.open(ClassinvitationsComponent, {
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
          this.service.cancelClassJoinRequest(this.existingRequest.student_id).subscribe((res: any) => {
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
