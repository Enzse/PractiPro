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
import { CommentspopupComponent } from '../../popups/commentspopup/commentspopup.component';


@Component({
  selector: 'app-weekly-accomplishment-rep',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule],
  templateUrl: './weekly-accomplishment-rep.component.html',
  styleUrl: './weekly-accomplishment-rep.component.css'
})
export class WeeklyAccomplishmentRepComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.loadData();
  }

  successtoast = false;
  tabWeekNumbers: number[] = [1];

  ngOnInit() {
    const userId = this.service.getCurrentUserId();
    this.service.getMaxWarWeeks(userId).subscribe(
      weekNumbers => {
        this.tabWeekNumbers = weekNumbers;
      },
      error => {
        console.error('Error fetching week numbers:', error);
      }
    );
  }
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
    const userId = this.service.getCurrentUserId();

    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.service.uploadWar(userId, file, this.selectedTabLabel).subscribe(
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

  user: any;
  students: any;
  datalist: any[] = [];
  dataSource: any;

  loadData() {
    this.user = this.service.getCurrentUserId();
    this.service.getWarByUser(this.user).subscribe(res => {
      this.datalist = res;
      // console.log(this.students);
      this.dataSource = new MatTableDataSource(this.datalist);
    });
  }

  downloadWar(submissionId: number, fileName: string) {
    this.service.downloadWar(submissionId).subscribe(
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
        }, error => {
          Swal.fire({
            title: "Successfully Deleted Submission.",
            icon: "success"
          });
          this.loadData();
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
        table: 'war'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
