import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { SubmissionService } from '../../../../core/api/submission.service';
import { SubmittedFile } from '../../../../core/models/records';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { FileReviewListComponent } from '../../../../shared/practicum/file-review-list.component';
import { StudentReviewContextService } from '../student-review-context.service';

/** Weekly documentation files, newest week first. */
@Component({
  selector: 'app-documentation-tab',
  imports: [EmptyStateComponent, FileReviewListComponent],
  template: `
    @if (files() === null) {
      <div class="skeleton h-64 rounded-2xl"></div>
    } @else if (weeks().length === 0) {
      <section class="card">
        <app-empty-state icon="notebook:duotone" title="No documentation yet" description="Files the student uploads for each week show up here." />
      </section>
    } @else {
      <section class="card overflow-hidden">
        @for (week of weeks(); track week.week) {
          <div class="border-b border-slate-100 last:border-b-0">
            <div class="flex items-center justify-between bg-slate-50/60 px-5 py-2.5 sm:px-6">
              <h3 class="text-sm font-semibold text-slate-900">Week {{ week.week }}</h3>
              @if (week.pending > 0) {
                <span class="text-xs font-medium text-amber-700">{{ week.pending }} to review</span>
              }
            </div>
            <app-file-review-list [files]="week.files" table="documentations" commentsTable="comments_documentation" (changed)="changed()" />
          </div>
        }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentationTabComponent {
  private readonly review = inject(StudentReviewContextService);
  private readonly submissionApi = inject(SubmissionService);

  protected readonly files = signal<SubmittedFile[] | null>(null);
  protected readonly weeks = computed(() => {
    const byWeek = new Map<number, SubmittedFile[]>();
    for (const file of this.files() ?? []) {
      const week = file.week ?? 0;
      byWeek.set(week, [...(byWeek.get(week) ?? []), file]);
    }
    return [...byWeek.entries()]
      .sort(([a], [b]) => b - a)
      .map(([week, files]) => ({ week, files, pending: files.filter((f) => f.advisor_approval === 'Pending').length }));
  });

  constructor() {
    effect(() => {
      this.review.studentId();
      this.load();
    });
  }

  protected changed(): void {
    this.load();
    this.review.changed();
  }

  private load(): void {
    this.submissionApi.list('documentations', this.review.studentId()).subscribe({
      next: (res) => this.files.set([...res.payload].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))),
      error: () => this.files.set([]),
    });
  }
}
