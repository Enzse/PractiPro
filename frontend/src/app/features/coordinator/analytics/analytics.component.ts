import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ReportService } from '../../../core/api/report.service';
import { AnswerCounts } from '../../../core/models/records';
import { CRITERIA } from '../../../shared/practicum/final-report-questions';
import { RATED_SECTIONS } from '../../../shared/practicum/evaluation-questions';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ClassContextService } from '../class-context.service';
import { BarDatum, BarListComponent, RatingHistogramComponent, SplitBarComponent } from './charts';

type View = 'final-reports' | 'evaluations';

/** What the class's final reports and performance evaluations say, in aggregate. */
@Component({
  selector: 'app-analytics',
  imports: [PageHeaderComponent, EmptyStateComponent, BarListComponent, SplitBarComponent, RatingHistogramComponent],
  templateUrl: './analytics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent {
  protected readonly context = inject(ClassContextService);
  private readonly reportApi = inject(ReportService);

  protected readonly view = signal<View>('final-reports');
  private readonly finalCounts = signal<AnswerCounts | null>(null);
  private readonly evalCounts = signal<AnswerCounts | null>(null);
  protected readonly loading = signal(true);

  // Final reports

  protected readonly finalResponses = computed(() => this.n(this.finalCounts(), 'p1q1_yes_count') + this.n(this.finalCounts(), 'p1q1_no_count'));
  protected readonly criteria = computed(() =>
    CRITERIA.map((c) => ({ ...c, yes: this.n(this.finalCounts(), `${c.key}_yes_count`), no: this.n(this.finalCounts(), `${c.key}_no_count`) })),
  );
  protected readonly allowance = computed<BarDatum[]>(() => [
    { label: 'Meal', count: this.n(this.finalCounts(), 'p1q7x1_meal_count') },
    { label: 'Cash', count: this.n(this.finalCounts(), 'p1q7x1_cash_count') },
  ]);
  protected readonly achievement = computed<BarDatum[]>(() =>
    ['100', '75', '50', '25', '0'].map((step) => ({ label: `${step}%`, count: this.n(this.finalCounts(), `p2x1_${step}`) })),
  );
  protected readonly experience = computed<BarDatum[]>(() =>
    this.overall(this.finalCounts(), 'p3q1'),
  );

  // Evaluations

  protected readonly evaluated = computed(() => [1, 2, 3, 4, 5].reduce((sum, r) => sum + this.n(this.evalCounts(), `p1q1_${r}`), 0));
  protected readonly sections = computed(() =>
    RATED_SECTIONS.map((section) => ({
      title: section.title,
      items: section.items.map((item) => {
        const counts = [1, 2, 3, 4, 5].map((r) => this.n(this.evalCounts(), `${item.key}_${r}`));
        const total = counts.reduce((a, b) => a + b, 0);
        const average = total ? counts.reduce((sum, count, i) => sum + count * (i + 1), 0) / total : null;
        return { ...item, counts, average };
      }),
    })),
  );
  protected readonly performance = computed<BarDatum[]>(() => this.overall(this.evalCounts(), 'p4q1'));

  constructor() {
    effect(() => {
      const block = this.context.block();
      this.loading.set(true);
      let pending = 2;
      const done = () => --pending === 0 && this.loading.set(false);
      this.reportApi.finalReportAnalytics(block).subscribe({
        next: (res) => (this.finalCounts.set(res.payload[0] ?? null), done()),
        error: () => done(),
      });
      this.reportApi.evaluationAnalytics(block).subscribe({
        next: (res) => (this.evalCounts.set(res.payload[0] ?? null), done()),
        error: () => done(),
      });
    });
  }

  protected setView(view: View): void {
    this.view.set(view);
  }

  private overall(counts: AnswerCounts | null, key: string): BarDatum[] {
    return [
      { label: 'Excellent', count: this.n(counts, `${key}_excellent`) },
      { label: 'Very good', count: this.n(counts, `${key}_verygood`) },
      { label: 'Good', count: this.n(counts, `${key}_good`) },
      { label: 'Fair', count: this.n(counts, `${key}_fair`) },
      { label: 'Poor', count: this.n(counts, `${key}_poor`) },
    ];
  }

  /** The API returns counts as strings (or null when nobody answered). */
  private n(counts: AnswerCounts | null, key: string): number {
    return Number(counts?.[key] ?? 0) || 0;
  }
}
