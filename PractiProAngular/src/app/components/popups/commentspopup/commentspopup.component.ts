import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-commentspopup',
  standalone: true,
  imports: [],
  templateUrl: './commentspopup.component.html',
  styleUrl: './commentspopup.component.css'
})
export class CommentspopupComponent {

  fileID: number;
  fileName: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<CommentspopupComponent>) {
    this.fileID = data.fileID;
    this.fileName = data.fileName;
  }

}
