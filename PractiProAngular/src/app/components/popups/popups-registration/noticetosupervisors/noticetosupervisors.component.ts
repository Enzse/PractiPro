import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-noticetosupervisors',
  standalone: true,
  imports: [],
  templateUrl: './noticetosupervisors.component.html',
  styleUrl: './noticetosupervisors.component.css'
})
export class NoticetosupervisorsComponent {
  constructor(private dialog: MatDialogRef<NoticetosupervisorsComponent>) { }


  closePopup() {
    this.dialog.close();
  }
}
