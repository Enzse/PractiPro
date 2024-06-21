import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import saveAs from 'file-saver';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { PdfviewerComponent } from '../../popups/shared/pdfviewer/pdfviewer.component';


@Component({
  selector: 'app-exit-poll',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule, MatButtonModule, MatMenuModule, MatTooltipModule, NgxPaginationModule],
  templateUrl: './exit-poll.component.html',
  styleUrl: './exit-poll.component.css'
})
export class ExitPollComponent implements OnInit, OnDestroy {
  userId: any;
  datalist: any[] = [];
  p: number = 1;
  file:any;
  pdfPreview?: SafeResourceUrl;
  private subscriptions = new Subscription();

  constructor(private service: AuthService, private dialog: MatDialog, private sanitizer:DomSanitizer) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadData();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
    this.service.getSubmissionsByStudent('finalreports', this.userId).subscribe(res => {
      if (res) {
        console.log(res);
        this.datalist = res.payload;
      }
    }));
  }

  onFileChange(event: any) {
    const files = event.target.files as FileList;
    if (files.length > 0) {
      this.file = files[0];
      this.previewPDF(); 
    }
  }

  previewPDF() {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileURL = e.target?.result as string;
      this.pdfPreview = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
    };
    reader.readAsDataURL(this.file);
  }


  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      console.log(file);
      if (file) {
        this.subscriptions.add(
        this.service.uploadSubmission('finalreports', this.userId, file).subscribe(
          response => {
            console.log('File uploaded successfully:', response);
            Swal.fire({
              title: "Uploaded Successfully!",
              text: "Please wait for your coordinator's approval.",
              icon: "success"
            });
            this.loadData();
            this.pdfPreview = undefined;
            fileInput.value = '';
          },
          error => {
            console.error('Error uploading file:', error);
          }
        ));
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
    const pdfPath = '../../assets/pdfTemplates/ExitPoll.pdf';
    window.open(pdfPath, '_blank');
  }

  viewFile() {
    const popup = this.dialog.open(PdfviewerComponent, {
      enterAnimationDuration: "0ms",
      exitAnimationDuration: "500ms",
      width: "90%",
      data: {
        templateName: '../../assets/pdfTemplates/ExitPoll.pdf'
      }
    })
  }



  downloadFile(submissionId: number, fileName: string) {
    this.subscriptions.add(
    this.service.getSubmissionFile('finalreports', submissionId).subscribe(
      (data: any) => {
        saveAs(data, fileName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    ));
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
        this.subscriptions.add(
        this.service.deleteSubmission(submissionId, 'finalreports').subscribe((res: any) => {
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
        }));
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
    this.subscriptions.add(
    popup.afterClosed().subscribe(res => {
      this.loadData()
    }));
  }

}
