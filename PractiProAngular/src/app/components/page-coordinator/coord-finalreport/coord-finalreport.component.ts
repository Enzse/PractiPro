import { Component } from '@angular/core';
import { CoordNavbarComponent } from '../coord-navbar/coord-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ViewsubmissionsComponent } from '../../page-admin/viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../../page-admin/reviewsubmissions/reviewsubmissions.component';
import { RequirementspopupComponent } from '../../popups/requirementspopup/requirementspopup.component';
import { FinalreportpopupComponent } from '../../popups/finalreportpopup/finalreportpopup.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';
import { BlockService } from '../../../services/block.service';

interface Student {
  id: number;
  // Add other properties here...
}

@Component({
  selector: 'app-coord-finalreport',
  standalone: true,
  imports: [CoordNavbarComponent, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent, FormsModule, FilterPipe],
  templateUrl: './coord-finalreport.component.html',
  styleUrl: './coord-finalreport.component.css'
})
export class CoordFinalreportComponent {

  constructor(private service: AuthService, private dialog: MatDialog, private blockService: BlockService) {
  }

  Coordinator: any;
  students: any;
  studentlist: any[] = [];
  dataSource: any;
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


  closeModal() {
    // Add code to close the modal here
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  evaluateStudent(code: any) {
    const popup = this.dialog.open(ViewsubmissionsComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "50%",
      data: {
        usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadHeldStudents()
    });

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
    popup.afterClosed().subscribe(res => {
      this.loadHeldStudents()
    });

  }



  toggleEvaluation(id: number, currentValue: boolean) {
    const newValue = currentValue ? 0 : 1; // Toggle the current value
    const requestData = {
      id: id,
      newEvaluation: newValue
    };

    this.service.toggleStudentEvaluation(requestData).subscribe(
      (response) => {
        console.log('Evaluation toggled successfully:', response);
        // Find the student in the array and update their evaluation status
        const studentIndex = this.studentlist.findIndex(student => student.id === id);
        if (studentIndex !== -1) {
          this.studentlist[studentIndex].evaluation = newValue;
        }
      },
      (error) => console.error('Error toggling evaluation:', error)
    );
  }




}
