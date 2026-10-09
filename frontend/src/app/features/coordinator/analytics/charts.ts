import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

/*
 * Small, dependency-free charts for the analytics page. Colours come from the
 * data-* tokens (validated with the dataviz palette checker); text stays in ink.
 */

export interface BarDatum {
  label: string;
  count: number;
}

/** Horizontal bars, one per category, single hue. Counts are labelled at the bar tips. */
@Component({
  selector: 'app-bar-list',
  imports: [MatTooltipModule],
  template: `
    <ul class="space-y-2">
      @for (bar of bars(); track bar.label) {
        <li class="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3"
          [matTooltip]="bar.count + ' ' + unit() + (bar.count === 1 ? '' : 's') + ' (' + bar.percent + '%)'">
          <span class="truncate text-sm text-slate-600">{{ bar.label }}</span>
          <span class="h-3 overflow-hidden rounded-r bg-data-track">
            <span class="block h-full rounded-r bg-data-blue" [style.width.%]="bar.width"></span>
          </span>
          <span class="text-right text-sm font-medium text-slate-900">{{ bar.count }}</span>
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarListComponent {
  readonly data = input.required<BarDatum[]>();
  /** What one count is, for the tooltip ("student", "objective"). */
  readonly unit = input('student');

  protected readonly bars = computed(() => {
    const data = this.data();
    const max = Math.max(1, ...data.map((d) => d.count));
    const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
    return data.map((d) => ({ ...d, width: (d.count / max) * 100, percent: Math.round((d.count / total) * 100) }));
  });
}

/** Two-part 100% bar (Yes / No), with a 2px surface gap between the parts. */
@Component({
  selector: 'app-split-bar',
  imports: [MatTooltipModule],
  template: `
    <div class="flex h-3 w-full gap-[2px]" role="img" [attr.aria-label]="yes() + ' yes, ' + no() + ' no'">
      @if (total() === 0) {
        <span class="h-full w-full rounded bg-slate-100"></span>
      } @else {
        @if (yes() > 0) {
          <span class="h-full rounded-l bg-data-blue" [class.rounded-r]="no() === 0" [style.width.%]="(yes() / total()) * 100"
            [matTooltip]="yes() + ' answered yes'"></span>
        }
        @if (no() > 0) {
          <span class="h-full rounded-r bg-data-orange" [class.rounded-l]="yes() === 0" [style.width.%]="(no() / total()) * 100"
            [matTooltip]="no() + ' answered no'"></span>
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitBarComponent {
  readonly yes = input(0);
  readonly no = input(0);
  protected readonly total = computed(() => this.yes() + this.no());
}

/** How many students gave each rating from 1 to 5, as five small columns. */
@Component({
  selector: 'app-rating-histogram',
  imports: [MatTooltipModule],
  template: `
    <div class="flex items-end gap-[3px]" role="img" [attr.aria-label]="description()">
      @for (count of counts(); track $index) {
        <span class="flex flex-col items-center gap-0.5" [matTooltip]="'Rated ' + ($index + 1) + ': ' + count + (count === 1 ? ' student' : ' students')">
          <span class="flex h-6 w-3 items-end">
            <span class="w-full rounded-t-[2px]" [class]="count > 0 ? 'bg-data-blue' : 'bg-slate-200'"
              [style.height.%]="count > 0 ? (count / max()) * 100 : 8"></span>
          </span>
          <span class="text-[9px] leading-none text-slate-400">{{ $index + 1 }}</span>
        </span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingHistogramComponent {
  /** Counts for ratings 1 to 5. */
  readonly counts = input.required<number[]>();
  protected readonly max = computed(() => Math.max(1, ...this.counts()));
  protected readonly description = computed(() =>
    this.counts().map((count, i) => `${count} rated ${i + 1}`).join(', '),
  );
}
