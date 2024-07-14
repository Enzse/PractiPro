import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationpopupComponent } from '../../popups/popups-coordinator/documentationpopup/documentationpopup.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { BlockService } from '../../../services/block.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule, } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ViewprofilepopupComponent } from '../../popups/shared/viewprofilepopup/viewprofilepopup.component';
import { DtrpopupcomponentComponent } from '../../popups/popups-coordinator/dtrpopupcomponent/dtrpopupcomponent.component';
import { SeminarspopupComponent } from '../../popups/popups-coordinator/seminarspopup/seminarspopup.component';
import { WarpopupcomponentComponent } from '../../popups/popups-coordinator/warpopupcomponent/warpopupcomponent.component';
import { CoordEvaluationspopupComponent } from '../../popups/popups-coordinator/coord-evaluationspopup/coord-evaluationspopup.component';
import { FinalreportpopupComponent } from '../../popups/popups-coordinator/finalreportpopup/finalreportpopup.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coord-documentation',
  standalone: true,
  imports: [CommonModule, DocumentationpopupComponent, DocumentationpopupComponent, FormsModule, FilterPipe, NgxPaginationModule, MatMenuModule, MatButtonModule],
  templateUrl: './coord-documentation.component.html',
  styleUrl: './coord-documentation.component.css'
})
export class CoordDocumentationComponent implements OnInit, OnDestroy {
  constructor(private service: AuthService, private dialog: MatDialog, private blockService: BlockService) { }
  Coordinator: any;
  students: any;
  studentlist: any;
  searchtext: any;
  currentBlock: any;
  isLoading: boolean = false;
  p: number = 1; /* starting no. of the list */
  private subscriptions = new Subscription();


  ngOnInit(): void {
    this.subscriptions.add(
      this.blockService.selectedBlock$.subscribe(block => {
        this.currentBlock = block;
        if (this.currentBlock) {
          this.loadHeldStudents();
        } else {
          console.log(`Submissions: no block selected`);
        }
        console.log(`Submissions: ${this.currentBlock}`);
      }));
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  loadHeldStudents() {
    this.isLoading = true;
    this.subscriptions.add(
      this.service.getAllStudentsFromClass(this.currentBlock).subscribe(res => {
        this.studentlist = res.payload;
        this.studentlist = this.studentlist.filter((student: any) => student.registration_status === 1);
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
      }));
  }


  viewDocumentations(student: any) {
    const popup = this.dialog.open(DocumentationpopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewDtrs(student: any) {
    const popup = this.dialog.open(DtrpopupcomponentComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewSeminars(student: any) {
    const popup = this.dialog.open(SeminarspopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewWars(student: any) {
    const popup = this.dialog.open(WarpopupcomponentComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewEvaluations(student: any) {
    const popup = this.dialog.open(CoordEvaluationspopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }
  viewFinalReports(student: any) {
    const popup = this.dialog.open(FinalreportpopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "80%",
      data: {
        student: student
      }
    })
  }

  viewProfile(student: any) {
    const popup = this.dialog.open(ViewprofilepopupComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "350ms",
      width: "auto",
      data: {
        student_id: student
      }
    })
  }

}
