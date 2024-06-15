
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-spv-dtrpopup',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './spv-dtrpopup.component.html',
  styleUrl: './spv-dtrpopup.component.css'
})
export class SpvDtrpopupComponent implements OnInit, OnDestroy{
  constructor(private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SpvDtrpopupComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];
  isLoading = true;
  p: number = 1; 
  itemsPerPage: number = 8
  datalist:any[] = [];

  setInitialPage(): void {
    const totalItems = this.datalist.length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    this.p = totalPages;
  }

  ngOnInit(): void {
    this.loadData();

  }
  ngOnDestroy(): void {
    
  }

  loadData() {
    console.log(this.data.student.id)
    this.service.getDtrs(this.data.student.id).subscribe((res: any) => {
      console.log(res)
      this.datalist = res.payload;
      console.log(this.datalist)
      this.setInitialPage();
    }
    );
    
  }


  toggleApproval(id: number, currentValue: number) {
    let newValue: number;

    if (currentValue === 0) {
      newValue = 1;
    } else if (currentValue === 1) {
      newValue = -1;
    } else {
      newValue = 0;
    }
    const requestData = {
      submissionId: id,
      newRemark: newValue
    };
    this.service.toggleSubmissionRemark('dtr', requestData).subscribe(
      (response) => {
        console.log('Submission remark toggled successfully:', response);

        const submissionIndex = this.studentSubmissions.findIndex(submission => submission.id === id);
        if (submissionIndex !== -1) {
          this.studentSubmissions[submissionIndex].remarks = newValue;
        }
      },
      (error) => console.error('Error toggling Submission remark:', error)
    );
  }

}
