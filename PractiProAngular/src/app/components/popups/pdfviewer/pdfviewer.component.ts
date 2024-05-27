import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdfviewer',
  standalone: true,
  imports: [PdfViewerModule, CommonModule],
  templateUrl: './pdfviewer.component.html',
  styleUrl: './pdfviewer.component.css'
})
export class PdfviewerComponent implements OnInit {

  fileData: any;
  pdfUrl: SafeResourceUrl | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<PdfviewerComponent>, private sanitizer: DomSanitizer) {
    this.fileData = data.selectedPDF;
  }


  ngOnInit(): void {
    console.log(this.fileData);

    if (this.fileData) {

      const url = URL.createObjectURL(this.fileData);

      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      console.log(this.pdfUrl)
    }
  }

}
