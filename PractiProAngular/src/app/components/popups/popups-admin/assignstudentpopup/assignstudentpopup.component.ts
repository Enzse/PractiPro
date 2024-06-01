import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { FilterPipe } from '../../../../filter.pipe';
import { OrdinalPipe } from '../../../../ordinal.pipe';
import { initFlowbite } from 'flowbite';
import { NgSelectModule } from '@ng-select/ng-select';
import { SelectstudentspopupComponent } from '../../selectstudentspopup/selectstudentspopup.component';

@Component({
  selector: 'app-assignstudentpopup',
  standalone: true,
  imports: [NgSelectModule, ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatCheckboxModule, FilterPipe, OrdinalPipe],
  templateUrl: './assignstudentpopup.component.html',
  styleUrl: './assignstudentpopup.component.css'
})
export class AssignstudentpopupComponent {
  classlist: any;
  studentlist: any;
  selection: any[] = [];
  selectedlist: any[] = [];
  searchtext: any;

  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, @Inject(PLATFORM_ID) private platformId: Object, private dialog: MatDialogRef<AssignstudentpopupComponent>, private dialog2: MatDialog) {
    this.service.getClasses().subscribe(res => {
      this.classlist = res;
    });
    this.service.getAllStudents().subscribe(res => {

      this.studentlist = res;

      console.log(this.studentlist);
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) initFlowbite();
    this.loadData();

  }

  inputform = this.builder.group({
    block_name: this.builder.control('', Validators.required)
  });

  submitForm() {
    if (this.inputform.valid) {
      console.log(this.inputform.value);
      // this.service.assignClassCoordinator(this.inputform.value).subscribe(() => {
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
        console.log(res);
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
        this.service.getStudent(data).subscribe((res: any) => {
          console.log(res);
          this.selectedlist.push(res[0]);
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
        this.service.assignClassStudent(item.id, this.inputform.value).subscribe((res: any) => {
          console.log("Success");
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
