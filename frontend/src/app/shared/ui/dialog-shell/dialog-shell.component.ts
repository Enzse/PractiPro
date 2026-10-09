import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons.generated';

/**
 * The frame of a dialog: a header with title and close button, a scrolling
 * body, and an optional footer for actions. Open the dialog with
 * `panelClass: 'app-dialog'` so the frame controls the padding.
 *
 *   <app-dialog-shell title="Edit profile" description="...">
 *     ...body...
 *     <ng-container dialogFooter> <button class="btn btn-primary">Save</button> </ng-container>
 *   </app-dialog-shell>
 */
@Component({
  selector: 'app-dialog-shell',
  imports: [IconComponent],
  template: `
    <div class="flex max-h-[90vh] flex-col">
      <header class="flex items-start gap-3 px-6 pb-4 pt-5">
        @if (icon(); as icon) {
          <span class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <app-icon [name]="icon" [size]="20" />
          </span>
        }
        <div class="min-w-0 flex-1">
          <h2 class="font-display text-lg font-semibold tracking-[-0.01em] text-slate-900">{{ title() }}</h2>
          @if (description()) {
            <p class="mt-0.5 text-[13px] leading-5 text-slate-500">{{ description() }}</p>
          }
        </div>
        @if (dialogRef) {
          <button type="button" class="icon-btn -mr-2 -mt-1" (click)="dialogRef.close()">
            <app-icon name="x" [size]="18" label="Close" />
          </button>
        }
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        <ng-content />
      </div>
      <ng-content select="[dialogFooter]" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogShellComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly icon = input<IconName>();

  protected readonly dialogRef = inject(MatDialogRef, { optional: true });
}
