import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../shared/commentspopup/commentspopup.component';
import { PdfviewerComponent } from '../../shared/pdfviewer/pdfviewer.component';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-addcertificatepopup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './addcertificatepopup.component.html',
  styleUrl: './addcertificatepopup.component.css'
})
export class AddcertificatepopupComponent {
  userId:any
  file:any;
  pdfPreview?: SafeResourceUrl;
  constructor(
    private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data:any,
    private dialogRef: MatDialogRef<AddcertificatepopupComponent>,
    private changeDetection: ChangeDetectionService,
    private sanitizer:DomSanitizer){
    this.userId = this.service.getCurrentUserId();
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
      if (file) {
        this.service.uploadSeminarCertificate(this.data.id, file).subscribe(
          response => {
            this.changeDetection.notifyChange(true);
            Swal.fire({
              title: "Uploaded Successfully!",
              text: "You can view your uploaded evaluations for this student in the table below",
              icon: "success"
            });
            this.dialogRef.close();
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
}
