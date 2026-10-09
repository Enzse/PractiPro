import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { OrdinalPipe } from '../../../pipes/ordinal.pipe';
import { ClassService } from '../../../services/api/class.service';

@Component({
    selector: 'app-coord-classes',
    imports: [MatSelectModule, MatButtonModule, OrdinalPipe],
    templateUrl: './coord-classes.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coord-classes.component.css'
})
export class CoordClassesComponent {
  private readonly classApi = inject(ClassService);
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<CoordClassesComponent>) { }

  datalist: any;
  currentuser: any;
  isLoading: boolean = true;


  ngOnInit(): void {
    if (this.data.coordinatorId != null && this.data.coordinatorId != '') {
      this.classApi.coordinator(this.data.coordinatorId).subscribe(res => {
        this.currentuser = res.payload[0]
      });
      this.loadData();
    }
  }

  loadData() {
    this.isLoading = true;
    this.classApi.ofCoordinator(this.data.coordinatorId).subscribe((res) => {
        this.datalist = res?.payload;
        this.isLoading = false;
      },
      (error: any) => {
        this.isLoading = false;
        if (error.status == 404) {
          console.log('No classes found.')
        } else {
          console.error('Error fetching classes:', error);
        }

      }
    );
  }

  selectClass(block: any) {
    this.dialog.close(block);
  }

}
