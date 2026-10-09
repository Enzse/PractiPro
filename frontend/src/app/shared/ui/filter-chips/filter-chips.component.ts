import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

/** A row of mutually exclusive filter chips: [(value)] holds the selected one. */
@Component({
  selector: 'app-filter-chips',
  template: `
    <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1" role="group" [attr.aria-label]="label()">
      @for (option of options(); track option.value) {
        <button type="button" class="chip" [class.chip-active]="value() === option.value"
          [attr.aria-pressed]="value() === option.value" (click)="value.set(option.value)">
          {{ option.label }}
          @if (option.count !== undefined) {
            <span class="tabular-nums" [class]="value() === option.value ? 'text-white/70' : 'text-slate-400'">{{ option.count }}</span>
          }
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterChipsComponent {
  readonly options = input.required<FilterOption[]>();
  readonly value = model.required<string>();
  readonly label = input('Filter');
}
