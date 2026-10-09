import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-choose-role-popup',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './choose-role-popup.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './choose-role-popup.component.css'
})
export class ChooseRolePopupComponent {

  constructor(private dialog: MatDialogRef<ChooseRolePopupComponent>) { }


  closePopup() {
    this.dialog.close();
  }

}


