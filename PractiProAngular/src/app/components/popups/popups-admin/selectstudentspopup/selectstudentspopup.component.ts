import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OrdinalPipe } from '../../../../pipes/ordinal.pipe';
import { StudentService } from '../../../../services/api/student.service';
import { ClassService } from '../../../../services/api/class.service';

@Component({
    selector: 'app-selectstudentspopup',
    imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, OrdinalPipe],
    templateUrl: './selectstudentspopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './selectstudentspopup.component.css'
})
export class SelectstudentspopupComponent {
  private readonly studentApi = inject(StudentService);
  private readonly classApi = inject(ClassService);
  constructor(private builder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SelectstudentspopupComponent>) { }

  datalist: any[] = [];
  currentblock: any;
  selectedstudents: any[] = [];

  ngOnInit(): void {
    console.log(this.data.chosenblock)
    this.classApi.get(this.data.chosenblock).subscribe((res: any) => {
      this.studentApi.byCourseAndYear(res.payload[0].course, res.payload[0].year_level).subscribe(
        (res: any) => {
          this.datalist = res.payload;
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
