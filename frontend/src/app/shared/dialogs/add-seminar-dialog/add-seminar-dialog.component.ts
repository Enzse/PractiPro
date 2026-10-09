import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NonNullableFormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataRefreshService } from '../../../core/data-refresh.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionService } from '../../../core/auth/session.service';
import { SeminarService } from '../../../core/api/seminar.service';

@Component({
    selector: 'app-add-seminar-dialog',
    imports: [FormsModule, ReactiveFormsModule, CommonModule, MatTooltipModule],
    templateUrl: './add-seminar-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './add-seminar-dialog.component.css'
})
export class AddSeminarDialogComponent {
  private readonly session = inject(SessionService);
  private readonly seminarApi = inject(SeminarService);
  userId: number;
  seminarRecordForm: FormGroup;
  isUploading = false;

  file: any;
  pdfPreview?: SafeResourceUrl;

  constructor(
    private builder: NonNullableFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddSeminarDialogComponent>,
    private changeDetection: DataRefreshService,
    private sanitizer: DomSanitizer) {

    this.userId = this.session.requireUserId();

    this.seminarRecordForm = this.builder.group({
      event_name: this.builder.control('', Validators.required),
      event_date: this.builder.control('', Validators.required),
      event_type: this.builder.control('', Validators.required),
      duration: this.builder.control('', Validators.required),
    });
  }

  submitRecord() {
    if (this.seminarRecordForm.valid) {
      this.seminarApi.create(this.data.id, this.seminarRecordForm.value).subscribe((res) => {

        this.isUploading = true;
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((fileInput: any) => {
          const file = fileInput.files[0];
          if (file) {
            this.seminarApi.uploadCertificate(res.payload.record_id, file).subscribe(
              response => {
                this.changeDetection.notifyChange(true);
                this.isUploading = false;
              },
              error => {
                console.error('Error uploading file:', error);
                this.isUploading = false;
              }
            );
          }
        });

        this.changeDetection.notifyChange(true);
        Swal.fire({
          title: "Training Record Added!",
          icon: "success"
        });
        this.dialogRef.close();
      })
    }
    else {
      Swal.fire({
        title: "Invalid data.",
        text: "Please enter valid data before submitting the record.",
        icon: "warning"
      });
      this.isUploading = false;
    }
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

  closePopup() {
    this.dialogRef.close()
  }
}
