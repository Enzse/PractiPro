import { Component, OnInit, OnDestroy} from '@angular/core';
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
  traineesList: any[] = [];
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(
    private service: AuthService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private changeDetection: ChangeDetectionService
  ) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadData();
    this.subscriptions.add(
      this.changeDetection.changeDetected$.subscribe(changeDetected => {
        if (changeDetected) {
          this.loadData();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  
  loadData() {
    console.log("Loading Data...");
    this.subscriptions.add(
      this.service.getStudentsBySupervisor(this.userId).subscribe((res: any) => {
        this.traineesList = res.payload.map((student: any) => {
          return { ...student, avatar: '' };
        });
        this.traineesList.forEach((student: any) => {
          this.subscriptions.add(
            this.service.getAvatar(student.id).subscribe((res: any) => {
              if (res.size > 0) {
                const url = URL.createObjectURL(res);
                student.avatar = this.sanitizer.bypassSecurityTrustUrl(url);
              }
            })
          );
        });
      })
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
