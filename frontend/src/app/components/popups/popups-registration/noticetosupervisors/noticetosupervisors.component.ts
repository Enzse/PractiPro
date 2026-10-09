import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-noticetosupervisors',
    imports: [],
    templateUrl: './noticetosupervisors.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './noticetosupervisors.component.css'
})
export class NoticetosupervisorsComponent {
  constructor(private dialog: MatDialogRef<NoticetosupervisorsComponent>) { }


  closePopup() {
    this.dialog.close();
  }
}
