import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { SpvEvaluationpopupComponent } from '../../popups/popups-supervisor/spv-evaluationpopup/spv-evaluationpopup.component';

@Component({
  selector: 'app-supervisor-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './supervisor-evaluation.component.html',
  styleUrl: './supervisor-evaluation.component.css'
})
export class SupervisorEvaluationComponent implements OnInit, OnDestroy {
  userId: any;
  user: any;
  traineesList: any[] = [];
  avatarUrl?: SafeUrl;
  searchtext: any;
  private subscriptions = new Subscription();

  constructor(private service: AuthService, private dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.userId = this.service.getCurrentUserId();
    this.subscriptions.add(
      this.service.getSupervisors(this.userId).subscribe((res: any) => {
        this.user = res.payload[0];
      })
    );
  }


  ngOnInit(): void {
    this.loadData();
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
        this.traineesList = this.traineesList.filter((student: any) => student.TotalHoursWorked >= 26);
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

  viewTemplate() {
    const pdfPath = '../../assets/pdfTemplates/Evaluation.pdf';
    window.open(pdfPath, '_blank');
  }

  viewEvaluation(student: any) {
    const popup = this.dialog.open(SpvEvaluationpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: '90%',
      data: {
        student: student
      }
    });

  }
}
