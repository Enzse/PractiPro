import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-termsofservice',
    imports: [],
    templateUrl: './termsofservice.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './termsofservice.component.css'
})
export class TermsofserviceComponent {
  constructor(private dialog: MatDialogRef<TermsofserviceComponent>) { }


  closePopup() {
    this.dialog.close();
  }
}
