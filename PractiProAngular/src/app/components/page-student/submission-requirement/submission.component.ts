import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import saveAs from 'file-saver';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-submission',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule, MatButtonModule, MatMenuModule],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.css'
})
export class SubmissionComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.loadData();
  }
  successtoast = false;

  selectedTabLabel: string = 'Resume';
  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabLabel = event.tab.textLabel.split(" ").join("");
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
        this.service.uploadSubmission('submissions', userId, file, this.selectedTabLabel).subscribe(
          response => {
            console.log('File uploaded successfully:', response);
            Swal.fire({
              title: "Uploaded Successfully!",
              text: "You can view your submissions and their approval status on the table below.",
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



  user: any;
  students: any;
  datalist: any[] = [];
  dataSource: any;

  loadData() {
    this.user = this.service.getCurrentUserId();
    this.service.getSubmissionsByStudent('submissions', this.user).subscribe(res => {
      if (res) {
        this.datalist = res.payload;
        this.dataSource = new MatTableDataSource(this.datalist);
        console.log(this.datalist);
      } else {
        console.log("No submissions yet.")
      }
    }, error => {
      console.log(error);
    });
  }

  downloadFile(submissionId: number, fileName: string) {
    this.service.getSubmissionFile('submissions', submissionId).subscribe(
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
        this.service.deleteSubmission(submissionId, 'submissions').subscribe((res: any) => {
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
        table: 'comments_requirements'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}