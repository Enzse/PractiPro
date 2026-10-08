
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-pdfviewer',
    imports: [],
    templateUrl: './pdfviewer.component.html',
    styleUrl: './pdfviewer.component.css'
})
export class PdfviewerComponent implements OnInit {

  fileData: any;
  templateName: any;
  pdfUrl: SafeResourceUrl | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<PdfviewerComponent>, private sanitizer: DomSanitizer) {
    if (data.selectedPDF) {
      this.fileData = data.selectedPDF;
    }
    if (data.templateName) {
      this.templateName = data.templateName;
    }
  }


  ngOnInit(): void {

    if (this.fileData) {
      const url = URL.createObjectURL(this.fileData);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    else if (this.templateName) {
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.templateName);
    }
  }

}
