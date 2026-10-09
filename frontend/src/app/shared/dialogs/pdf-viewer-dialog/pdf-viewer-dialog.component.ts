
import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-pdf-viewer-dialog',
    imports: [],
    templateUrl: './pdf-viewer-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './pdf-viewer-dialog.component.css'
})
export class PdfViewerDialogComponent implements OnInit {

  fileData: any;
  templateName: any;
  pdfUrl: SafeResourceUrl | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<PdfViewerDialogComponent>, private sanitizer: DomSanitizer) {
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
