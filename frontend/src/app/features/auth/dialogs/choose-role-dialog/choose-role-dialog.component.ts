import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-choose-role-dialog',
    imports: [RouterLink],
    templateUrl: './choose-role-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './choose-role-dialog.component.css'
})
export class ChooseRoleDialogComponent {

  constructor(private dialog: MatDialogRef<ChooseRoleDialogComponent>) { }


  closePopup() {
    this.dialog.close();
  }

}


