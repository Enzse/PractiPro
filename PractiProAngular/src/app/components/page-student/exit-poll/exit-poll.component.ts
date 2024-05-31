import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import saveAs from 'file-saver';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/commentspopup/commentspopup.component';


@Component({
  selector: 'app-exit-poll',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule],
  templateUrl: './exit-poll.component.html',
  styleUrl: './exit-poll.component.css'
})
export class ExitPollComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.loadData();
  }

  successtoast = false;

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const userId = this.service.getCurrentUserId();

    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      console.log(file);
      if (file) {
        this.service.uploadFinalReport(userId, file).subscribe(
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
    this.service.getFinalReportByUser(this.user).subscribe(res => {
      if (res) {
        console.log(res);
        this.datalist = res;
        this.dataSource = new MatTableDataSource(this.datalist);
      }
    });
  }

  downloadFinalReport(submissionId: number, fileName: string) {
    this.service.downloadFinalReport(submissionId).subscribe(
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
        table: 'finalreports'
      }
    })
    popup.afterClosed().subscribe(res => {
      this.loadData()
    });
  }

}
