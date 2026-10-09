import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PerformanceEvaluation } from '../../core/models/records';
import { COMMENT_QUESTIONS, RATED_SECTIONS, RECOMMEND_QUESTION } from './evaluation-questions';

/** A submitted performance evaluation, read-only. Used by coordinators and supervisors. */
@Component({
  selector: 'app-evaluation-answers',
  template: `
    @for (section of sections; track section.title) {
      <div class="border-b border-slate-100">
        <h3 class="bg-slate-50/60 px-5 py-2.5 text-sm font-semibold text-slate-900 sm:px-6">{{ section.title }}</h3>
        <ul class="divide-y divide-slate-100">
          @for (item of section.items; track item.key) {
            @let score = rating(item.key);
            <li class="flex items-center justify-between gap-6 px-5 py-3 sm:px-6">
              <span class="text-sm text-slate-700">{{ item.text }}</span>
              <span class="flex shrink-0 items-center gap-2" [attr.aria-label]="'Rated ' + score + ' of 5'">
                <span class="flex gap-0.5" aria-hidden="true">
                  @for (step of [1, 2, 3, 4, 5]; track step) {
                    <span class="h-2 w-4 rounded-sm" [class]="step <= score ? 'bg-data-blue' : 'bg-data-track'"></span>
                  }
                </span>
                <span class="w-4 text-right text-sm font-semibold text-slate-900">{{ score || '–' }}</span>
              </span>
            </li>
          }
        </ul>
      </div>
    }

    <div class="grid gap-6 p-5 sm:grid-cols-3 sm:px-6">
      <div>
        <p class="eyebrow">Overall</p>
        <p class="mt-1 font-display text-xl font-semibold text-slate-900">{{ text('p4q1') }}</p>
      </div>
      <div class="sm:col-span-2">
        <p class="eyebrow">Recommended for employment</p>
        <p class="mt-1 text-sm text-slate-700">
          <span class="font-semibold capitalize">{{ text(recommend.key) }}</span>
          @if (text(recommend.reasonKey) !== '—') {
            <span class="text-slate-500"> · {{ text(recommend.reasonKey) }}</span>
          }
        </p>
      </div>
    </div>

    <dl class="grid gap-5 border-t border-slate-100 p-5 sm:grid-cols-2 sm:px-6">
      @for (question of comments; track question.key) {
        <div>
          <dt class="text-xs text-slate-500">{{ question.text }}</dt>
          <dd class="mt-1 whitespace-pre-line text-sm text-slate-800">{{ text(question.key) }}</dd>
        </div>
      }
    </dl>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationAnswersComponent {
  readonly evaluation = input.required<PerformanceEvaluation>();

  protected readonly sections = RATED_SECTIONS;
  protected readonly comments = COMMENT_QUESTIONS;
  protected readonly recommend = RECOMMEND_QUESTION;

  protected rating(key: string): number {
    return Number(this.evaluation()[key] ?? 0);
  }

  protected text(key: string): string {
    const value = this.evaluation()[key];
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }
}
