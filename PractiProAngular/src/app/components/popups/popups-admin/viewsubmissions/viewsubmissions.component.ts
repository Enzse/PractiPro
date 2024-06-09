import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-viewsubmissions',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './viewsubmissions.component.html',
  styleUrl: './viewsubmissions.component.css'
})
export class ViewsubmissionsComponent implements OnInit {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewsubmissionsComponent>) { }

  studentRequirements: any[] = [];

  ngOnInit(): void {
    console.log(this.data.usercode)
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getStudentRequirements(this.data.usercode).subscribe(
        (res:any) => {
          this.studentRequirements = res.payload;
          console.log(this.studentRequirements);
        },
        (error: any) => {
          console.error('Error fetching student requirements:', error);
        }
      );
    }
  }

  toggleRequirement(requirement: string, value: boolean) {

    Swal.fire({
      title: "Are you sure you want to toggle this requirement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        const newValue = value ? 0 : 1;
        const requestData = {
          studentId: this.data.usercode,
          requirement: requirement,
          status: newValue
        };
        console.log(requestData);
        this.service.toggleRequirementStatus(requestData).subscribe(
          (response) => {
            console.log('Requirement status toggled successfully:', response);

            this.refreshStudentRequirements();
          },
          (error) => {
            console.error('Error toggling requirement status:', error);
          }
        );
        Swal.fire({
          title: "Requirement Toggled!",
          text: "The student should be able to see it on his/her dashboard.",
          icon: "success"
        });
      }
    });

  }

  refreshStudentRequirements() {
    // Refresh the student requirements list
    this.service.getStudentRequirements(this.data.usercode).subscribe(
      (res: any) => {
        this.studentRequirements = res.payload;
        console.log('Student requirements refreshed:', this.studentRequirements);
      },
      (error: any) => {
        console.error('Error refreshing student requirements:', error);
      }
    );
  }
}
