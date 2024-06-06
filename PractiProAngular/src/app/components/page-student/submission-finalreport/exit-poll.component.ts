import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import saveAs from 'file-saver';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';


@Component({
  selector: 'app-exit-poll',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule],
  templateUrl: './exit-poll.component.html',
  styleUrl: './exit-poll.component.css'
})
export class ExitPollComponent implements OnInit {
  userId: any;
  datalist: any[] = [];
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.service.getSubmissionsByStudent('finalreports', this.userId).subscribe(res => {
      if (res) {
        console.log(res);
        this.datalist = res.payload;
      }
    });
  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      console.log(file);
      if (file) {
        this.service.uploadFinalReport(this.userId, file).subscribe(
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
    this.service.getSubmissionFile('finalreports', submissionId).subscribe(
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
        this.service.deleteSubmission(submissionId, 'finalreports').subscribe((res: any) => {
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
        table: 'comments_finalreports'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
