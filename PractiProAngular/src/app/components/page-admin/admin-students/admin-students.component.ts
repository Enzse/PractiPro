import { Component } from '@angular/core';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ViewsubmissionsComponent } from '../viewsubmissions/viewsubmissions.component';
import { ReviewsubmissionsComponent } from '../reviewsubmissions/reviewsubmissions.component';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../../filter.pipe';
import { OrdinalPipe } from '../../../ordinal.pipe';
import { AssignstudentpopupComponent } from '../../popups/assignstudentpopup/assignstudentpopup.component';
import { InspectprofilepopupComponent } from '../../popups/inspectprofilepopup/inspectprofilepopup.component';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, ViewsubmissionsComponent, ReviewsubmissionsComponent, FormsModule, FilterPipe, OrdinalPipe],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.css'
})
export class AdminStudentsComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.Loaduser();
  }
  students:any;
  studentlist: any;
  dataSource: any;
  searchtext: any;
  ngOnInit(): void {
   
   }

  Loaduser() {
    this.service.getAllStudents().subscribe(res => {
      this.studentlist = res;
      this.dataSource = new MatTableDataSource(this.studentlist);
    });
  }

  assignStudents() {
    const popup = this.dialog.open(AssignstudentpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        // usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
      this.Loaduser()
    });

  }

  closeModal() {
    // Add code to close the modal here
    const modal = document.getElementById('crud-modal');
    modal?.classList.add('hidden');
  }

  Updateuser(code: any) {
    const popup = this.dialog.open(ViewsubmissionsComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
        this.Loaduser()      
    });

  }  


  viewInfo(code: any) {
    const popup = this.dialog.open(InspectprofilepopupComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
        this.Loaduser()      
    });

  }  

  viewSubmissions(code: any) {
    const popup = this.dialog.open(ReviewsubmissionsComponent, {
      enterAnimationDuration: "1000ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        usercode: code
      }
    })
    popup.afterClosed().subscribe(res => {
        this.Loaduser()      
    });
  }  

  toggleEvaluation(id: number, currentValue: boolean) {
    const newValue = currentValue ? 0 : 1; 
    const requestData = {
      id: id,
      newEvaluation: newValue
    };
  
    this.service.toggleStudentEvaluation(requestData).subscribe(
      (response) => {
        console.log('Evaluation toggled successfully:', response);        
        const studentIndex = this.studentlist.findIndex((student:any) => student.id === id);
        if (studentIndex !== -1) {
          this.studentlist[studentIndex].evaluation = newValue;
        }
      },
      (error) => console.error('Error toggling evaluation:', error)
    );
  }

  
}

