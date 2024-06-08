import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-viewtraineepopup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewtraineepopup.component.html',
  styleUrl: './viewtraineepopup.component.css'
})
export class ViewtraineepopupComponent {
  constructor(private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ViewtraineepopupComponent>) {
    console.log(data);
  }




}
