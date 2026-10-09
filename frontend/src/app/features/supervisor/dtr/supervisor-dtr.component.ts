import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SupervisorDtrDialogComponent } from '../dialogs/dtr-dialog/supervisor-dtr-dialog.component';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { SessionService } from '../../../core/auth/session.service';
import { StudentService } from '../../../core/api/student.service';
import { MediaService } from '../../../core/api/media.service';

@Component({
    selector: 'app-supervisor-dtr',
    imports: [CommonModule, FormsModule, FilterPipe],
    templateUrl: './supervisor-dtr.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./supervisor-dtr.component.css']
})
export class SupervisorDtrComponent implements OnInit {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly mediaApi = inject(MediaService);
  userId: number;
  traineesList$: Observable<any[]>;
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private changeDetection: DataRefreshService
  ) {
    this.userId = this.session.requireUserId();
    this.traineesList$ = this.loadTraineesWithAvatars();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.traineesList$ = this.loadTraineesWithAvatars();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
          pending_dtr_count: 0 // Initialize pending_war_count
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
                  student.pending_dtr_count = res.payload[0].pending_dtr_count;
                }
                return student; // Return the student with updated pending_war_count
              }),
              catchError(() => {
                student.pending_dtr_count = 0; // Set to 0 if there's an error
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



  viewDtrs(student: any) {
    const popup = this.dialog.open(SupervisorDtrDialogComponent, {
      enterAnimationDuration: '500ms',
      exitAnimationDuration: '500ms',
      width: '90%',
      data: {
        student: student
      }
    });
  }
}
