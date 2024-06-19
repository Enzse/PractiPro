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
    this.traineesList$ = this.loadTraineesWithAvatars();
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
