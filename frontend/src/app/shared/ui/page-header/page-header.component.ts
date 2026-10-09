import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The title block at the top of a page, with room for actions on the right:
 *
 *   <app-page-header title="Requirements" description="...">
 *     <button pageActions class="btn btn-primary">...</button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  template: `
    <header class="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
      <div class="min-w-0">
        @if (eyebrow()) {
          <p class="eyebrow mb-2">{{ eyebrow() }}</p>
        }
        <h1 class="page-title">{{ title() }}</h1>
        @if (description()) {
          <p class="mt-2 max-w-2xl text-[15px] leading-6 text-slate-500">{{ description() }}</p>
        }
      </div>
      <div class="flex shrink-0 flex-wrap items-center gap-2 empty:hidden">
        <ng-content select="[pageActions]" />
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly eyebrow = input<string>();
}
