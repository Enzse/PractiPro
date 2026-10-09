import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons.generated';
import { ToastService, ToastTone } from './toast.service';

const ICON: Record<ToastTone, IconName> = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'warning-circle',
  info: 'info',
};

const ICON_COLOUR: Record<ToastTone, string> = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  warning: 'text-amber-500',
  info: 'text-brand-600',
};

/** Renders the toasts from ToastService. Placed once, in the app root. */
@Component({
  selector: 'app-toast-host',
  imports: [IconComponent],
  template: `
    <div class="pointer-events-none fixed inset-x-0 bottom-0 z-toast flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      aria-live="polite" aria-atomic="false">
      @for (toast of toasts.toasts(); track toast.id) {
        <div class="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl bg-white p-4 shadow-overlay ring-1 ring-slate-900/10"
          [attr.role]="toast.tone === 'error' ? 'alert' : 'status'">
          <app-icon [name]="icon[toast.tone]" [size]="20" class="mt-0.5" [class]="colour[toast.tone]" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-900">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="mt-0.5 text-[13px] leading-5 text-slate-500">{{ toast.message }}</p>
            }
          </div>
          <button type="button" class="-m-1.5 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            (click)="toasts.dismiss(toast.id)">
            <app-icon name="x" [size]="16" label="Dismiss" />
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHostComponent {
  protected readonly toasts = inject(ToastService);
  protected readonly icon = ICON;
  protected readonly colour = ICON_COLOUR;
}
