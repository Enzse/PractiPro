import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { OrdinalPipe } from '../../../../pipes/ordinal.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { SelectstudentspopupComponent } from '../selectstudentspopup/selectstudentspopup.component';
import { StudentService } from '../../../../services/api/student.service';
import { ClassService } from '../../../../services/api/class.service';

@Component({
    selector: 'app-assignstudentpopup',
    imports: [NgSelectModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, FilterPipe, OrdinalPipe],
    templateUrl: './assignstudentpopup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './assignstudentpopup.component.css'
})
export class AssignstudentpopupComponent {
  private readonly studentApi = inject(StudentService);
  private readonly classApi = inject(ClassService);
  classlist: any;
  studentlist: any;
  selection: any[] = [];
  selectedlist: any[] = [];
  searchtext: any;

  constructor(private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<AssignstudentpopupComponent>, private dialog2: MatDialog) {
    this.classApi.all().subscribe(res => {
      this.classlist = res.payload;
    });
    this.studentApi.all().subscribe(res => {

      this.studentlist = res.payload

      console.log(this.studentlist);
    });
  }

  ngOnInit(): void {
    this.loadData();

  }

  inputform = this.builder.group({
    block_name: this.builder.control('', Validators.required)
  });

  submitForm() {
    if (this.inputform.valid) {
      // this.classApi.assignCoordinator(this.inputform.value).subscribe(() => {
      //   this.dialog.close();
      //   Swal.fire({
      //     title: "Request Successful!",
      //     icon: "success"
      //   });
      // });
    } else {
      Swal.fire({
        title: "Uh-oh!",
        text: "It seems you've entered invalid data.",
        icon: "error"
      });
    }
  }

  selectStudentsPopup() {
    if (this.inputform.value.block_name) {


      const popup = this.dialog2.open(SelectstudentspopupComponent, {
        enterAnimationDuration: "500ms",
        exitAnimationDuration: "500ms",
        width: "60%",
        data: {
          chosenblock: this.inputform.value.block_name
        }
      })
      popup.afterClosed().subscribe((res: any) => {
        this.selection = res;
        console.log(`Current Selected: ${this.selection}`)
        this.loadData();
      });
    }
    else {
      Swal.fire({
        title: "Please select a class first.",
        text: "We tailor your options according to the course of the class you select.",
        icon: "warning"
      });
    }
  }

  loadData() {
    if (this.selection) {
      this.selection.forEach(data => {
        this.studentApi.get(data).subscribe((res: any) => {
          this.selectedlist.push(res.payload[0]);
        })
      });
    }
  }

  onClassChange(e: any) {
    // Check if it's not the default option
    this.clearData();// Reset the selectedlist array

  }

  clearData() {
    this.selectedlist = []
  }


  proceedAssign() {
    if (this.inputform.valid) {
      this.selectedlist.forEach(item => {
        this.studentApi.joinClass(item.id, this.inputform.getRawValue()).subscribe((res: any) => {
        })
      });
    }
    this.dialog.close();
    Swal.fire({
      title: "Request Successful!",
      icon: "success"
    });
  }

}
