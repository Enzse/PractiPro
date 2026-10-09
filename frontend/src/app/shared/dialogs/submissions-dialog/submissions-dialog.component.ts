import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { StudentService } from '../../../core/api/student.service';

@Component({
    selector: 'app-submissions-dialog',
    imports: [],
    templateUrl: './submissions-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './submissions-dialog.component.css'
})
export class SubmissionsDialogComponent implements OnInit {
  private readonly studentApi = inject(StudentService);
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SubmissionsDialogComponent>) { }

  studentRequirements: any[] = [];

  ngOnInit(): void {
    if (this.data.usercode != null && this.data.usercode != '') {
      this.studentApi.requirements(this.data.usercode).subscribe(
        (res:any) => {
          this.studentRequirements = res.payload;
        },
        (error: any) => {
          console.error('Error fetching student requirements:', error);
        }
      );
    }
  }

}
