import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CoordNavbarComponent } from '../coord-navbar/coord-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FinalreportpopupComponent } from '../../popups/popups-coordinator/finalreportpopup/finalreportpopup.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { BlockService } from '../../../services/block.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ViewprofilepopupComponent } from '../../popups/shared/viewprofilepopup/viewprofilepopup.component';
import { Subscription } from 'rxjs';
import { ChangeDetectionService } from '../../../services/shared/change-detection.service';

@Component({
    selector: 'app-coord-finalreport',
    imports: [CoordNavbarComponent, CommonModule, FormsModule, FilterPipe, NgxPaginationModule, MatMenuModule, MatButtonModule],
    templateUrl: './coord-finalreport.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coord-finalreport.component.css'
})
export class CoordFinalreportComponent implements OnInit, OnDestroy {

  constructor(private changeDetection: ChangeDetectionService, private service: AuthService, private dialog: MatDialog, private blockService: BlockService) {
  }

  Coordinator: any;
  students: any;
  studentlist: any[] = [];
  searchtext: any;
  currentBlock: any;
  isLoading: boolean = false;
  private subscriptions = new Subscription();
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

  viewSubmissions(code: any) {
    const popup = this.dialog.open(FinalreportpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        usercode: code
      }
    })
  }

  viewProfile(student: any) {
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
