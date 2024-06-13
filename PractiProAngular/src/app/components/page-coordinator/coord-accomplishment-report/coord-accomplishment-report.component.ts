import { Component } from '@angular/core';
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

@Component({
  selector: 'app-coord-accomplishment-report',
  standalone: true,
  imports: [CoordNavbarComponent, CommonModule, FormsModule, FilterPipe, NgxPaginationModule],
  templateUrl: './coord-accomplishment-report.component.html',
  styleUrl: './coord-accomplishment-report.component.css'
})
export class CoordAccomplishmentReportComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog, private blockService: BlockService) {}
  Coordinator: any;
  students: any;  
  studentlist: any;
  searchtext: any;
  currentBlock: any;
  isLoading: boolean = false;
  p: number = 1; /* starting no. of the list */

  ngOnInit(): void {
    this.blockService.selectedBlock$.subscribe(block => {
      this.currentBlock = block;
      if (this.currentBlock) {
        this.loadHeldStudents();
      } else {
        console.log(`Submissions: no block selected`);
      }

      console.log(`Submissions: ${this.currentBlock}`);
    });
  }


  loadHeldStudents() {
    this.isLoading = true;
    this.service.getAllStudentsFromClass(this.currentBlock).subscribe(res => {
      this.studentlist = res.payload;
      this.isLoading = false;
      console.log(this.studentlist);
    }, err => {
      this.isLoading = false;
      console.error(err);
    });
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
    // popup.afterClosed().subscribe(res => {
    //   this.loadHeldStudents()
    // });

  }


}
