import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoordNavbarComponent } from '../coord-navbar/coord-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FinalreportpopupComponent } from '../../popups/popups-coordinator/finalreportpopup/finalreportpopup.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { BlockService } from '../../../services/block.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CoordEvaluationspopupComponent } from '../../popups/popups-coordinator/coord-evaluationspopup/coord-evaluationspopup.component';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';
import { Subscription } from 'rxjs';
import { ViewprofilepopupComponent } from '../../popups/shared/viewprofilepopup/viewprofilepopup.component';

@Component({
  selector: 'app-coord-evaluations',
  standalone: true,
  imports: [CoordNavbarComponent, CommonModule, FormsModule, FilterPipe, NgxPaginationModule, MatMenuModule, MatButtonModule],
  templateUrl: './coord-evaluations.component.html',
  styleUrl: './coord-evaluations.component.css'
})
export class CoordEvaluationsComponent implements OnInit, OnDestroy {

  constructor(private service: AuthService, private dialog: MatDialog, private blockService: BlockService, private changeDetection: ChangeDetectionService) {
  }

  Coordinator: any;
  students: any;
  studentlist: any[] = [];
  searchtext: any;
  currentBlock: any;
  private subscriptions = new Subscription();
  isLoading: boolean = false;
  p: number = 1; /* starting no. of the list */

  ngOnInit(): void {
    this.blockService.selectedBlock$.subscribe(block => {
      this.currentBlock = block;
      this.loadHeldStudents();
      this.subscriptions.add(
        this.changeDetection.changeDetected$.subscribe(changeDetected => {
          if (changeDetected) {
            this.loadHeldStudents();
          }
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadHeldStudents() {
    this.isLoading = true;
    this.subscriptions.add(
    this.service.getAllStudentsFromClass(this.currentBlock).subscribe(res => {
      this.studentlist = res.payload;
      this.studentlist = this.studentlist.filter((student: any) => student.TotalHoursWorked >= 200);
      this.isLoading = false;
      console.log(this.studentlist);
    }, err => {
      this.isLoading = false;
      console.error(err);
    }));
  }

  viewEvaluations(student: any) {
    const popup = this.dialog.open(CoordEvaluationspopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }

  viewProfile(student:any) {
    const popup = this.dialog.open(ViewprofilepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "500ms",
      width: "auto",
      data: {
        student: student
      }
    })
  }

}
