import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, Subscription, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { SpvWarpopupComponent } from '../../popups/popups-supervisor/spv-warpopup/spv-warpopup.component';

@Component({
  selector: 'app-supervisor-war',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './supervisor-war.component.html',
  styleUrl: './supervisor-war.component.css'
})
export class SupervisorWarComponent {
  userId: any;
  traineesList$: Observable<any[]>;
  searchtext: any;

  constructor(private service: AuthService, private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.service.getCurrentUserId();
    this.traineesList$ = this.loadTraineesWithAvatars()

    this.traineesList$.subscribe(trainees => {
      console.log('Trainees List:', trainees);
      trainees.forEach(trainee => {
        console.log(`Trainee ID: ${trainee.id}, Pending WAR Count: ${trainee.pending_war_count}`);
      });
    });
  }

  private loadTraineesWithAvatars(): Observable<any> {
    return this.service.getStudentsBySupervisor(this.userId).pipe(
      switchMap((res: any) => {
        if (!res.payload || res.payload.length === 0) {
          return of([]);
        }

        const trainees = res.payload.map((user: any) => ({
          ...user,
          avatar: '',
          pending_war_count: 0 // Initialize pending_war_count
        }));

        // Create an array of observables for avatars and pending counts
        const avatarObservables = trainees.map((student: any) => {
          return forkJoin({
            avatar: this.service.getAvatar(student.id).pipe(
              map((res: any) => {
                if (res.size > 0) {
                  const url = URL.createObjectURL(res);
                  student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
                }
                return student;
              }),
              catchError(() => of(student))
            ),
            pendingCount: this.service.checkIfStudentHasPendingSubmission(student.id).pipe(
              map((res: any) => {
                if (res.payload && res.payload.length > 0) {
                  student.pending_war_count = res.payload[0].pending_war_count_supervisor;
                }
                return student; // Return the student with updated pending_war_count
              }),
              catchError(() => {
                student.pending_war_count = 0; // Set to 0 if there's an error
                return of(student);
              })
            )
          });
        });

        // Combine both observables
        return forkJoin(avatarObservables).pipe(
          map((results: any) => results.map((result: any) => result.avatar)) // Only return the updated trainees
        );
      }),
      catchError(() => of([]))
    );
  }



  checkForPending(trainees: any[]) {
    trainees.forEach((trainee: any) => {
      this.service.checkIfStudentHasPendingSubmission(trainee.id).subscribe((res: any) => {
        // Check if payload exists and access pending_war_count
        if (res.payload && res.payload.length > 0) {
          const pendingCount = res.payload[0].pending_war_count;
          console.log(`Student ID: ${trainee.id}, Pending WAR Count: ${pendingCount}`);
          // You can also perform further actions based on the pending count here
        } else {
          console.log(`Student ID: ${trainee.id} has no pending submissions.`);
        }
      });
    });
  }



  viewWars(student: any) {
    const popup = this.dialog.open(SpvWarpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        student: student
      }
    });

  }
}
