import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-supervisor-notice-dialog',
    imports: [],
    templateUrl: './supervisor-notice-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './supervisor-notice-dialog.component.css'
})
export class SupervisorNoticeDialogComponent {
  constructor(private dialog: MatDialogRef<SupervisorNoticeDialogComponent>) { }


  closePopup() {
    this.dialog.close();
  }
}
