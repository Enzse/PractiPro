import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SpvDtrpopupComponent } from '../../popups/popups-supervisor/spv-dtrpopup/spv-dtrpopup.component';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';

@Component({
  selector: 'app-supervisor-dtr',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './supervisor-dtr.component.html',
  styleUrls: ['./supervisor-dtr.component.css']
})
export class SupervisorDtrComponent implements OnInit {
  userId: any;
  traineesList$: Observable<any[]>;
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(
    private service: AuthService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private changeDetection: ChangeDetectionService
  ) {
    this.userId = this.service.getCurrentUserId();
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
    return this.service.getStudentsBySupervisor(this.userId).pipe(
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
    const popup = this.dialog.open(SpvDtrpopupComponent, {
      enterAnimationDuration: '500ms',
      exitAnimationDuration: '500ms',
      width: '90%',
      data: {
        student: student
      }
    });
  }
}
