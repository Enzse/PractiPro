import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-choose-role-popup',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './choose-role-popup.component.html',
  styleUrl: './choose-role-popup.component.css'
})
export class ChooseRolePopupComponent {

  constructor(private dialog: MatDialogRef<ChooseRolePopupComponent>) { }


  closePopup() {
    this.dialog.close();
  }

}


