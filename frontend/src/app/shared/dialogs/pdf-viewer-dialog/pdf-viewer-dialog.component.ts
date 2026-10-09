import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogShellComponent } from '../../ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../ui/icon/icon.component';

export interface PdfViewerData {
  /** A downloaded file to show. */
  selectedPDF?: Blob;
  /** Or the URL of a file to show, e.g. a template in assets/. */
  templateName?: string;
  title?: string;
}

/** Shows a PDF inside a dialog, with a way to open it in a new tab. */
@Component({
  selector: 'app-pdf-viewer-dialog',
  imports: [DialogShellComponent, IconComponent],
  template: `
    <app-dialog-shell [title]="data.title ?? 'Document'" icon="file-pdf">
      @if (url) {
        <object [data]="url" type="application/pdf" class="h-[70vh] w-full rounded-xl bg-slate-100 ring-1 ring-slate-200">
          <div class="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <p class="text-sm text-slate-500">This browser can’t show PDFs inside the page.</p>
            <a class="btn btn-secondary btn-sm" [href]="url" target="_blank" rel="noopener">
              <app-icon name="arrow-square-out" [size]="16" /> Open the file
            </a>
          </div>
        </object>
        <div class="mt-3 flex justify-end">
          <a class="link inline-flex items-center gap-1 text-sm" [href]="url" target="_blank" rel="noopener">
            Open in a new tab <app-icon name="arrow-square-out" [size]="14" />
          </a>
        </div>
      }
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewerDialogComponent {
  protected readonly data = inject<PdfViewerData>(MAT_DIALOG_DATA);
  protected readonly url: SafeResourceUrl | null;

  constructor() {
    const sanitizer = inject(DomSanitizer);
    if (this.data.selectedPDF) {
      const objectUrl = URL.createObjectURL(this.data.selectedPDF);
      inject(DestroyRef).onDestroy(() => URL.revokeObjectURL(objectUrl));
      this.url = sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
    } else if (this.data.templateName) {
      this.url = sanitizer.bypassSecurityTrustResourceUrl(this.data.templateName);
    } else {
      this.url = null;
    }
  }
}
