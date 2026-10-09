import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** A circular progress meter; the projected content sits in the middle. */
@Component({
  selector: 'app-progress-ring',
  template: `
    <div class="relative inline-flex items-center justify-center" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.width]="size()" [attr.height]="size()" class="-rotate-90" aria-hidden="true">
        <circle [attr.cx]="size() / 2" [attr.cy]="size() / 2" [attr.r]="radius()" fill="none"
          class="stroke-slate-100" [attr.stroke-width]="stroke()" />
        <circle [attr.cx]="size() / 2" [attr.cy]="size() / 2" [attr.r]="radius()" fill="none"
          [class]="colour()" [attr.stroke-width]="stroke()" stroke-linecap="round"
          [attr.stroke-dasharray]="circumference()" [attr.stroke-dashoffset]="offset()"
          style="transition: stroke-dashoffset 900ms cubic-bezier(0.2, 0.8, 0.2, 1)" />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <ng-content />
      </div>
    </div>
  `,
  host: { role: 'meter', '[attr.aria-valuenow]': 'value()', '[attr.aria-valuemax]': 'max()', 'aria-valuemin': '0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressRingComponent {
  readonly value = input(0);
  readonly max = input(100);
  readonly size = input(128);
  readonly stroke = input(10);
  /** Tailwind stroke class for the filled arc. */
  readonly colour = input('stroke-coral-500');

  protected readonly radius = computed(() => (this.size() - this.stroke()) / 2);
  protected readonly circumference = computed(() => 2 * Math.PI * this.radius());
  protected readonly offset = computed(() => {
    const fraction = Math.min(Math.max(this.value() / (this.max() || 1), 0), 1);
    return this.circumference() * (1 - fraction);
  });
}
