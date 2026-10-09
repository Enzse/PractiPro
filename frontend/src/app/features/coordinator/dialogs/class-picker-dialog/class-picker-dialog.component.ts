import { Component, OnInit, Inject, ChangeDetectionStrategy, inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { OrdinalPipe } from '../../../../shared/pipes/ordinal.pipe';
import { ClassService } from '../../../../core/api/class.service';
import { ClassProfile, Coordinator } from '../../../../core/models/class';

@Component({
    selector: 'app-class-picker-dialog',
    imports: [MatSelectModule, MatButtonModule, OrdinalPipe],
    templateUrl: './class-picker-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './class-picker-dialog.component.css'
})
export class ClassPickerDialogComponent {
  private readonly classApi = inject(ClassService);
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ClassPickerDialogComponent>) { }

  datalist: ClassProfile[] | undefined;
  currentuser: Coordinator | undefined;
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
