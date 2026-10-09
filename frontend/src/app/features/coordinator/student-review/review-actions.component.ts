import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApprovalStatus } from '../../../core/models/api';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

/**
 * Approve / Return buttons for one submission. The current decision is shown
 * as the pressed button; "Return" means the student has to redo it.
 */
@Component({
  selector: 'app-review-actions',
  imports: [MatTooltipModule, IconComponent],
  template: `
    <div class="inline-flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label="Review" [matTooltip]="disabledReason() ?? ''">
      <button type="button" [disabled]="busy() || !!disabledReason()" (click)="decide.emit('Approved')"
        [attr.aria-pressed]="status() === 'Approved'"
        class="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
        [class]="status() === 'Approved' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-emerald-700'">
        <app-icon name="check" [size]="14" /> {{ status() === 'Approved' ? 'Approved' : 'Approve' }}
      </button>
      <button type="button" [disabled]="busy() || !!disabledReason()" (click)="decide.emit('Unapproved')"
        [attr.aria-pressed]="status() === 'Unapproved'"
        class="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
        [class]="status() === 'Unapproved' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-red-700'">
        <app-icon name="arrow-counter-clockwise" [size]="14" /> {{ status() === 'Unapproved' ? 'Returned' : 'Return' }}
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewActionsComponent {
  readonly status = input<ApprovalStatus | string | undefined>();
  readonly busy = input(false);
  /** When set, the buttons are disabled and this explains why. */
  readonly disabledReason = input<string | null>(null);
  readonly decide = output<'Approved' | 'Unapproved'>();
}
