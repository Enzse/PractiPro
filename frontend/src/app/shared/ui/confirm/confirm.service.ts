import { ChangeDetectionStrategy, Component, Injectable, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { IconComponent } from '../icon/icon.component';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** "danger" for actions that delete or can't be undone. */
  tone?: 'primary' | 'danger';
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [IconComponent],
  template: `
    <div class="p-6 sm:w-[26rem]" role="alertdialog" [attr.aria-label]="data.title">
      <div class="flex gap-4">
        <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          [class]="data.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'">
          <app-icon [name]="data.tone === 'danger' ? 'warning' : 'info'" [size]="22" />
        </span>
        <div class="min-w-0 pt-1">
          <h2 class="text-base font-semibold text-slate-900">{{ data.title }}</h2>
          @if (data.message) {
            <p class="mt-1.5 text-sm leading-6 text-slate-500">{{ data.message }}</p>
          }
        </div>
      </div>
      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" class="btn btn-secondary" (click)="ref.close(false)">{{ data.cancelText ?? 'Cancel' }}</button>
        <button type="button" class="btn"
          [class]="data.tone === 'danger' ? 'btn-danger' : 'btn-primary'" (click)="ref.close(true)">
          {{ data.confirmText ?? 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly data = inject<ConfirmOptions>(MAT_DIALOG_DATA);
  protected readonly ref = inject<MatDialogRef<ConfirmDialogComponent, boolean>>(MatDialogRef);
}

/**
 * Asks the user to confirm an action. Emits true if they confirm, false if
 * they cancel or dismiss the dialog.
 *
 *   this.confirm.ask({ title: 'Delete this file?', tone: 'danger', confirmText: 'Delete' })
 *     .subscribe((yes) => { if (yes) ... });
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  ask(options: ConfirmOptions): Observable<boolean> {
    return this.dialog
      .open<ConfirmDialogComponent, ConfirmOptions, boolean>(ConfirmDialogComponent, {
        data: options,
        autoFocus: 'dialog',
        restoreFocus: true,
      })
      .afterClosed()
      .pipe(map((confirmed) => confirmed === true));
  }
}
