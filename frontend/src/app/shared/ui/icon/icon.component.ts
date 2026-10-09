import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICONS, IconName, IconPath } from './icons.generated';

/**
 * An icon from the app's Phosphor set, drawn inline in the current text colour.
 * Decorative by default; give it a `label` when it is the only content of a control.
 *
 *   <app-icon name="clock" />
 *   <app-icon name="files:duotone" [size]="48" />
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 256 256" fill="currentColor"
      [attr.aria-hidden]="label() ? null : 'true'" [attr.aria-label]="label() || null" [attr.role]="label() ? 'img' : null">
      @for (path of paths(); track $index) {
        <path [attr.d]="path.d" [attr.opacity]="path.o ?? null" />
      }
    </svg>
  `,
  host: { class: 'inline-flex shrink-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly label = input<string>();

  protected readonly paths = computed<IconPath[]>(() => ICONS[this.name()]);
}
