import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icons.generated';

/**
 * What to show where a list or section has nothing in it yet: what the space
 * is for, and (projected content) how to fill it.
 */
@Component({
  selector: 'app-empty-state',
  imports: [IconComponent],
  template: `
    <div class="flex flex-col items-center px-6 text-center" [class]="compact() ? 'py-8' : 'py-14'">
      <span class="mb-4 inline-flex items-center justify-center rounded-2xl bg-slate-100/80 text-slate-400"
        [class]="compact() ? 'h-12 w-12' : 'h-16 w-16'">
        <app-icon [name]="icon()" [size]="compact() ? 28 : 36" />
      </span>
      <h3 class="text-[15px] font-semibold text-slate-900">{{ title() }}</h3>
      @if (description()) {
        <p class="mt-1 max-w-sm text-sm leading-6 text-slate-500">{{ description() }}</p>
      }
      <div class="mt-5 flex flex-wrap justify-center gap-2 empty:hidden">
        <ng-content />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input<IconName>('files:duotone');
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly compact = input(false);
}
