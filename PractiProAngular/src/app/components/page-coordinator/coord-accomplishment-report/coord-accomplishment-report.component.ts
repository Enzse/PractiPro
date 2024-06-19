import { Component, OnDestroy } from '@angular/core';
import { CoordNavbarComponent } from '../coord-navbar/coord-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WarpopupcomponentComponent } from '../../popups/popups-coordinator/warpopupcomponent/warpopupcomponent.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { BlockService } from '../../../services/block.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ViewprofilepopupComponent } from '../../popups/shared/viewprofilepopup/viewprofilepopup.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coord-accomplishment-report',
  standalone: true,
  imports: [CoordNavbarComponent, CommonModule, FormsModule, FilterPipe, NgxPaginationModule, MatButtonModule, MatMenuModule],
  templateUrl: './coord-accomplishment-report.component.html',
  styleUrl: './coord-accomplishment-report.component.css'
})
export class CoordAccomplishmentReportComponent implements OnInit, OnDestroy {
  constructor(private service: AuthService, private dialog: MatDialog, private blockService: BlockService) {}
  Coordinator: any;
  students: any;  
  studentlist: any;
  searchtext: any;
  currentBlock: any;
  isLoading: boolean = false;
  private subscriptions = new Subscription();
  p: number = 1;

  ngOnInit(): void {
    this.blockService.selectedBlock$.subscribe(block => {
      this.currentBlock = block;
        this.loadHeldStudents();
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
      this.studentlist = this.studentlist.filter((student: any) => student.registration_status === 1);
      this.isLoading = false;
      console.log(this.studentlist);
    }, err => {
      this.isLoading = false;
      console.error(err);
    }));
  }
  
  viewSubmissions(code: any) {
    const popup = this.dialog.open(WarpopupcomponentComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        usercode: code
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
