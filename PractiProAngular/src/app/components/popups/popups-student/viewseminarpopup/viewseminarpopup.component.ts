import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-viewseminarpopup',
  standalone: true,
  imports: [CommonModule, PdfViewerModule],
  templateUrl: './viewseminarpopup.component.html',
  styleUrls: ['./viewseminarpopup.component.css']
})
export class ViewseminarpopupComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  pdfUrl: any;

  constructor(
    private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewseminarpopupComponent>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.service.getSubmissionFile('student_seminar_certificates', this.data.id).subscribe(
        (res: Blob) => {
          const url = URL.createObjectURL(res);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        },
        (error: any) => {
          console.error('Error viewing submission:', error);
        }
      )
    );
  }
}
