import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-terms-of-service-dialog',
    imports: [],
    templateUrl: './terms-of-service-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './terms-of-service-dialog.component.css'
})
export class TermsOfServiceDialogComponent {
  constructor(private dialog: MatDialogRef<TermsOfServiceDialogComponent>) { }


  closePopup() {
    this.dialog.close();
  }
}
