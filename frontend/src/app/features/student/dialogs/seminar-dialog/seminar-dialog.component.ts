import { Component, Inject, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DomSanitizer } from '@angular/platform-browser';
import { SubmissionService } from '../../../../core/api/submission.service';

@Component({
    selector: 'app-seminar-dialog',
    imports: [],
    templateUrl: './seminar-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./seminar-dialog.component.css']
})
export class SeminarDialogComponent implements OnInit, OnDestroy {
  private readonly submissionApi = inject(SubmissionService);
  private subscriptions: Subscription = new Subscription();
  pdfUrl: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SeminarDialogComponent>,
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
      this.submissionApi.download('student_seminar_certificates', this.data.id).subscribe(
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
