import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditjobpopupComponent } from '../editjobpopup/editjobpopup.component';

@Component({
  selector: 'app-viewtraineepopup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewtraineepopup.component.html',
  styleUrl: './viewtraineepopup.component.css'
})
export class ViewtraineepopupComponent implements OnInit {
  studentjob: any
  changeDetected: any;
  constructor(private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewtraineepopupComponent>, private dialog2: MatDialog) {
    this.changeDetected = [false];
  }


  ngOnInit(): void {
    this.loadData()
    
  }


  loadData() {
    this.service.getStudentJob(this.data.student.id).subscribe((res: any) => {
      this.studentjob = res.payload[0];
      console.log(this.studentjob);
    })
  }

  editJob() {
    const popup = this.dialog2.open(EditjobpopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: 'auto',
      data: {
        student: this.data.student,
        studentjob: this.studentjob
      }
    });
    popup.afterClosed().subscribe(res => {
      const changeDetected = res;
      if (changeDetected) {
        console.log("Change detected!");
        this.loadData();
        this.changeDetected = true;
      }
    })

  }

}
