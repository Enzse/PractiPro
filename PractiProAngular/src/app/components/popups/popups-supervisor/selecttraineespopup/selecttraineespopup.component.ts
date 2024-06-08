import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../../../filter.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-selecttraineespopup',
  standalone: true,
  imports: [CommonModule, FilterPipe, FormsModule],
  templateUrl: './selecttraineespopup.component.html',
  styleUrl: './selecttraineespopup.component.css'
})
export class SelecttraineespopupComponent implements OnInit {
  traineesList: any;
  searchtext: any;
  constructor(private service: AuthService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SelecttraineespopupComponent>) {

  }

  ngOnInit(): void {
    this.loadData()
  }

  loadData() {
    console.log(`company ID: ${this.data.company_id}`)
    this.service.getStudentsByCompany(this.data.company_id).subscribe((res: any) => {
      this.traineesList = res.payload;
      console.log(this.traineesList)
    })
  }

  addTrainees() {

  }
}
