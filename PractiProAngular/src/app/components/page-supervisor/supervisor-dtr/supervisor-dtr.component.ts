import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';
import { SupervisorNavbarComponent } from '../supervisor-navbar/supervisor-navbar.component';
import { DtrpopupcomponentComponent } from '../../popups/popups-coordinator/dtrpopupcomponent/dtrpopupcomponent.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { BlockService } from '../../../services/block.service';

@Component({
  selector: 'app-supervisor-dtr',
  standalone: true,
  imports: [SupervisorNavbarComponent, CommonModule, FormsModule, FilterPipe],
  templateUrl: './supervisor-dtr.component.html',
  styleUrl: './supervisor-dtr.component.css'
})
export class SupervisorDtrComponent {
  constructor(private service: AuthService, private dialog: MatDialog, private blockService: BlockService) {
  }


  Coordinator: any;
  studentlist: any;
  searchtext: any;
  currentBlock: any;
  isLoading: boolean = false;

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
      this.studentlist = res;
      this.isLoading = false;
      console.log(this.studentlist);
    }, err => {
      this.isLoading = false;
      console.error(err);
    });
  }


  viewSubmissions(code: any) {
    const popup = this.dialog.open(DtrpopupcomponentComponent, {
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
