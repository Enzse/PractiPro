
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkclasses',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, FormsModule, FilterPipe],
  templateUrl: './checkclasses.component.html',
  styleUrl: './checkclasses.component.css'
})
export class CheckclassesComponent {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<CheckclassesComponent>) { }

  datalist: any;
  currentuser: any;
  isLoading: boolean = true;

  ngOnInit(): void {
    if (this.data.usercode != null && this.data.usercode != '') {
      this.service.getAdvisors(this.data.usercode).subscribe(res => {
        console.log(res);
        this.currentuser = res.payload[0]
        console.log(this.currentuser);
      });
      this.loadData();
    }
  }

  loadData() {
    this.service.getClassesByCoordinator(this.data.usercode).subscribe(
      (res: any) => {
        this.datalist = res?.payload;
        this.isLoading = false;
        console.log(this.datalist);
      },
      (error: any) => {
        if (error.status == 404) {
          console.log('No classes found.')
        } else {
          console.error('Error fetching classes:', error);
        }

      }
    );
  }

  unassignCoordinator(block: any) {
    Swal.fire({
      title: "Are you sure?",
      text: `You are unassigning ${this.currentuser?.first_name} from ${block}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#20284a",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialog.close();
        this.service.unassignCoordinator(this.data.usercode, block).subscribe(() => {
          

        });
      }
    });
  }



}
