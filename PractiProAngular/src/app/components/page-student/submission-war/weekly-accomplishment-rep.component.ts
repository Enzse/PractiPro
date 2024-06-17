import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import saveAs from 'file-saver';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxPaginationModule } from 'ngx-pagination';


@Component({
  selector: 'app-weekly-accomplishment-rep',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule, MatButtonModule, MatMenuModule, NgxPaginationModule],
  templateUrl: './weekly-accomplishment-rep.component.html',
  styleUrl: './weekly-accomplishment-rep.component.css'
})
export class WeeklyAccomplishmentRepComponent {
  userId: any;
  datalist: any[] = [];
  tabWeekNumbers: number[] = [1];
  p: number = 1;

  constructor(private service: AuthService, private dialog: MatDialog) {
    this.userId = this.service.getCurrentUserId();
  }
  
  
  ngOnInit() {
    this.loadData();
    this.service.getSubmissionMaxWeeks('war', this.userId).subscribe(
      res => {
        this.tabWeekNumbers = res;
      },
      error => {
        console.error('Error fetching week numbers:', error);
      }
    );
  }
  loadData() {
    this.service.getSubmissionsByStudent('war', this.userId).subscribe(res => {
      this.datalist = res.payload;
    });
  }
  
  
  //SUBMISSION LOGIC
  addNewTab() {
    const nextWeekNumber = this.tabWeekNumbers[this.tabWeekNumbers.length - 1] + 1;
    this.tabWeekNumbers.push(nextWeekNumber);
  }

  selectedTabLabel: number = 1;
  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabLabel = parseInt(event.tab.textLabel.replace('Week ', ''), 10);
  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.service.uploadSubmission('war', this.userId, file, this.selectedTabLabel).subscribe(
          response => {
            console.log('File uploaded successfully:', response);
            Swal.fire({
              title: "Uploaded Successfully!",
              text: "Please wait for your coordinator's approval.",
              icon: "success"
            });
            this.loadData();
            fileInput.value = '';
          },
          error => {
            console.error('Error uploading file:', error);
          }
        );
      }
      else if (file == null) {
        Swal.fire({
          title: "No File to Upload",
          text: "Please select a file to upload first.",
          icon: "error"
        });
      }
    });
  }



  viewTemplate() {
    const pdfPath = '../../assets/pdfTemplates/WAR.pdf';
    window.open(pdfPath, '_blank');
  }


  downloadFile(submissionId: number, fileName: string) {
    this.service.getSubmissionFile('war',submissionId).subscribe(
      (data: any) => {
        saveAs(data, fileName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }

  deleteSubmission(submissionId: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteSubmission(submissionId, 'war').subscribe((res: any) => {
          Swal.fire({
            title: "Your submission has been deleted",
            icon: "success"
          });
          this.loadData();
        }, error => {
            Swal.fire({
              title: "Delete failed",
              text: "You may not have permission to delete this file.",
              icon: "error"
            });
        });
      }
    });
  }

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog.open(CommentspopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_war'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
