import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-viewsubmissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewsubmissions.component.html',
  styleUrl: './viewsubmissions.component.css'
})
export class ViewsubmissionsComponent implements OnInit {
  constructor(private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewsubmissionsComponent>) { }

  studentRequirements: any[] = [];

  ngOnInit(): void {
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getStudentRequirements(this.data.usercode).subscribe(
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
