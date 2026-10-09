import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, Subscription, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { SupervisorWeeklyReportDialogComponent } from '../dialogs/weekly-report-dialog/supervisor-weekly-report-dialog.component';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { MediaService } from '../../../core/api/media.service';

@Component({
    selector: 'app-supervisor-weekly-reports',
    imports: [CommonModule, FormsModule, FilterPipe],
    templateUrl: './supervisor-weekly-reports.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './supervisor-weekly-reports.component.css'
})
export class SupervisorWeeklyReportsComponent {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly mediaApi = inject(MediaService);
  userId: number;
  traineesList$: Observable<any[]>;
  searchtext: any;

  constructor(private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.session.requireUserId();
    this.traineesList$ = this.loadTraineesWithAvatars()

    this.traineesList$.subscribe(trainees => {
      console.log('Trainees List:', trainees);
      trainees.forEach(trainee => {
        console.log(`Trainee ID: ${trainee.id}, Pending WAR Count: ${trainee.pending_war_count}`);
      });
    });
  }

  private loadTraineesWithAvatars(): Observable<any> {
    return this.studentApi.ofSupervisor(this.userId).pipe(
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
            avatar: this.mediaApi.avatar(student.id).pipe(
              map((res: any) => {
                if (res.size > 0) {
                  const url = URL.createObjectURL(res);
                  student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
                }
                return student;
              }),
              catchError(() => of(student))
            ),
            pendingCount: this.studentApi.pendingSubmissions(student.id).pipe(
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
      this.studentApi.pendingSubmissions(trainee.id).subscribe((res) => {
        // Weekly reports awaiting this supervisor's approval
        if (res.payload && res.payload.length > 0) {
          const pendingCount = res.payload[0].pending_war_count_supervisor;
          console.log(`Student ID: ${trainee.id}, Pending WAR Count: ${pendingCount}`);
          // You can also perform further actions based on the pending count here
        } else {
          console.log(`Student ID: ${trainee.id} has no pending submissions.`);
        }
      });
    });
  }



  viewWars(student: any) {
    const popup = this.dialog.open(SupervisorWeeklyReportDialogComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        student: student
      }
    });

  }
}
