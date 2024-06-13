import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editschedulespopup.component.ts',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editschedulespopup.component.ts.component.html',
  styleUrl: './editschedulespopup.component.ts.component.css'
})
export class EditschedulespopupComponent {
  changeDetected: any;
  constructor(private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<EditschedulespopupComponent>, private dialog2: MatDialog) {
    this.changeDetected = [false];
  }


  schedules = [
    { day_of_week: 'Monday', start_time: '', end_time: '', has_work: false },
    { day_of_week: 'Tuesday', start_time: '', end_time: '', has_work: false },
    { day_of_week: 'Wednesday', start_time: '', end_time: '', has_work: false },
    { day_of_week: 'Thursday', start_time: '', end_time: '', has_work: false },
    { day_of_week: 'Friday', start_time: '', end_time: '', has_work: false },
    { day_of_week: 'Saturday', start_time: '', end_time: '', has_work: false },
    { day_of_week: 'Sunday', start_time: '', end_time: '', has_work: false }
  ];


  ngOnInit(): void {
    if (this.data.schedules.length > 0) {
      this.schedules = this.data.schedules
    }
  }

  toggleWork(schedule: any) {
    schedule.start_time = '';
    schedule.end_time = '';

  }


  assignSchedules() {
    this.service.assignSchedulesToStudent(this.data.student.id, this.schedules).subscribe(res => {
      this.changeDetected = true;
      this.dialog.close(this.changeDetected);
      Swal.fire({
        title: "Schedule saved!",
        icon: "success"
      });
    });
  }


  clearSchedules() {
    Swal.fire({
      title: "Are you sure you want to clear this student's schedule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.unassignSchedules(this.data.student.id).subscribe((res: any) => {
          Swal.fire({
            title: "Schedule deleted",
            icon: "success"
          });
          this.changeDetected = true;
          this.dialog.close(this.changeDetected);
        }, error => {
          Swal.fire({
            title: "Delete failed",
            text: "You may not have permission to delete this schedule.",
            icon: "error"
          });
        });
      }
    });
  }

}
