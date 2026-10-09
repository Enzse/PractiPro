import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** A text box for filtering a list, with a search icon and a clear button. */
@Component({
  selector: 'app-search-field',
  imports: [IconComponent],
  template: `
    <label class="relative block">
      <span class="sr-only">{{ placeholder() }}</span>
      <app-icon name="magnifying-glass" [size]="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input type="search" class="input pl-9 pr-9" [placeholder]="placeholder()" [value]="value()"
        (input)="value.set($any($event.target).value)" />
      @if (value()) {
        <button type="button" class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          (click)="value.set('')">
          <app-icon name="x" [size]="14" label="Clear search" />
        </button>
      }
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFieldComponent {
  readonly value = model('');
  readonly placeholder = input('Search');
}
