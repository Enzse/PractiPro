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

@Component({
  selector: 'app-supervisor-dtr',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './supervisor-dtr.component.html',
  styleUrls: ['./supervisor-dtr.component.css']
})
export class SupervisorDtrComponent {
  userId: any;
  traineesList$: Observable<any[]>;
  searchtext: any;

  constructor(
    private service: AuthService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.userId = this.service.getCurrentUserId();
    this.traineesList$ = this.loadTraineesWithAvatars();
    console.log(this.traineesList$)
  }

  private loadTraineesWithAvatars(): Observable<any> {
    return this.service.getStudentsBySupervisor(this.userId).pipe(
      switchMap((res: any) => {
        if (!res.payload || res.payload.length === 0) {
          return of([]);
        }

        const trainees = res.payload.map((user: any) => ({
          ...user,
          avatar: ''
        }));

        const avatarObservables = trainees.map((student: any) =>
          this.service.getAvatar(student.id).pipe(
            map((res: any) => {
              if (res.size > 0) {
                const url = URL.createObjectURL(res);
                student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
              }
              return student;
            }),
            catchError(() => of(student)) 
          )
        );

        return forkJoin(avatarObservables);
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
