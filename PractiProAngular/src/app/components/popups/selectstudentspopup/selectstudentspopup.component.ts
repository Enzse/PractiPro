import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OrdinalPipe } from '../../../ordinal.pipe';

@Component({
  selector: 'app-selectstudentspopup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, OrdinalPipe],
  templateUrl: './selectstudentspopup.component.html',
  styleUrl: './selectstudentspopup.component.css'
})
export class SelectstudentspopupComponent {
  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SelectstudentspopupComponent>) { }

  datalist: any[] = [];
  currentblock: any;
  selectedstudents: any[] = [];

  ngOnInit(): void {
    console.log(this.data.chosenblock)
    this.service.getClasses(this.data.chosenblock).subscribe((res: any) => {
      console.log(res);
      this.service.getStudentsByCourseAndYear(res[0].course, res[0].year_level).subscribe(
        (res: any) => {
          this.datalist = res;
          console.log(this.datalist);
        },
        (error: any) => {
          console.error('Error fetching students:', error);
        }
      );
    })
  }

  addToSelection(id: number) {
    const index = this.selectedstudents.indexOf(id);
    if (index === -1) {
      this.selectedstudents.push(id);
    } else {
      this.selectedstudents.splice(index, 1);
    }
    console.log(this.selectedstudents);
  }

  resetSelection() {
    this.selectedstudents = [];
  }

  closePopup() {
    this.dialog.close(this.selectedstudents);
  }




}
