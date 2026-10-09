import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SeminarService } from '../../../../core/api/seminar.service';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { DialogShellComponent } from '../../../../shared/ui/dialog-shell/dialog-shell.component';
import { FileDropComponent } from '../../../../shared/ui/file-drop/file-drop.component';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';

/** Attaches a certificate to a seminar record. Closes with true when uploaded. */
@Component({
  selector: 'app-add-certificate-dialog',
  imports: [DialogShellComponent, FileDropComponent, IconComponent],
  template: `
    <app-dialog-shell title="Add a certificate" [description]="data.name ?? 'Attach the certificate you received, as a PDF.'" icon="certificate">
      <app-file-drop [(file)]="file" />
      <footer dialogFooter class="dialog-footer">
        <button type="button" class="btn btn-secondary" (click)="dialogRef.close(false)">Cancel</button>
        <button type="button" class="btn btn-primary" [disabled]="!file() || uploading()" (click)="upload()">
          @if (uploading()) {
            <app-icon name="circle-notch" [size]="16" class="animate-spin" />
          }
          Upload certificate
        </button>
      </footer>
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCertificateDialogComponent {
  protected readonly data = inject<{ id: number; name?: string }>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject<MatDialogRef<AddCertificateDialogComponent, boolean>>(MatDialogRef);
  private readonly seminarApi = inject(SeminarService);
  private readonly refresh = inject(DataRefreshService);
  private readonly toast = inject(ToastService);

  protected readonly file = signal<File | null>(null);
  protected readonly uploading = signal(false);

  protected upload(): void {
    const file = this.file();
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.seminarApi.uploadCertificate(this.data.id, file).subscribe({
      next: () => {
        this.refresh.notifyChange(true);
        this.toast.success('Certificate added');
        this.dialogRef.close(true);
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error('Upload failed', 'Please try again.');
      },
    });
  }
}
