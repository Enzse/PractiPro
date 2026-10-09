import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { SubmissionService } from '../../../../core/api/submission.service';
import { StudentService } from '../../../../core/api/student.service';
import { SubmittedFile } from '../../../../core/models/records';
import { StudentRequirements } from '../../../../core/models/student';
import { REQUIREMENT_TYPES } from '../../../../shared/practicum/requirement-types';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { FileReviewListComponent } from '../file-review-list.component';
import { StudentReviewContextService } from '../student-review-context.service';

/** The eight pre-practicum documents, each with the files uploaded for it. */
@Component({
  selector: 'app-requirements-tab',
  imports: [IconComponent, FileReviewListComponent],
  template: `
    @if (files() === null) {
      <div class="skeleton h-64 rounded-2xl"></div>
    } @else {
      <section class="card overflow-hidden">
        <header class="flex items-center justify-between gap-4 border-b border-slate-100 p-5 sm:px-6">
          <div>
            <h2 class="section-title">Requirements</h2>
            <p class="text-sm text-slate-500">The practicum pages open for the student once all of these are approved.</p>
          </div>
          <span class="shrink-0 text-sm text-slate-500"><span class="font-semibold text-slate-900">{{ approvedCount() }}</span> of {{ groups().length }} approved</span>
        </header>

        @for (group of groups(); track group.label) {
          <div class="border-b border-slate-100 last:border-b-0">
            <div class="flex items-center justify-between gap-3 bg-slate-50/60 px-5 py-2.5 sm:px-6">
              <h3 class="text-sm font-semibold text-slate-900">{{ group.label }}</h3>
              @if (group.approved) {
                <span class="flex items-center gap-1 text-xs font-medium text-emerald-700"><app-icon name="check-circle" [size]="14" /> Approved</span>
              } @else if (group.files.length === 0) {
                <span class="text-xs text-slate-400">Not uploaded</span>
              } @else if (group.pending > 0) {
                <span class="text-xs font-medium text-amber-700">{{ group.pending }} to review</span>
              } @else {
                <span class="text-xs font-medium text-red-600">Returned</span>
              }
            </div>
            @if (group.files.length > 0) {
              <app-file-review-list [files]="group.files" table="submissions" commentsTable="comments_requirements" (changed)="changed()" />
            }
          </div>
        }
      </section>
      @if (files()!.length === 0) {
        <p class="mt-3 text-center text-sm text-slate-500">This student hasn’t uploaded any requirements yet.</p>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequirementsTabComponent {
  private readonly review = inject(StudentReviewContextService);
  private readonly submissionApi = inject(SubmissionService);
  private readonly studentApi = inject(StudentService);

  protected readonly files = signal<SubmittedFile[] | null>(null);
  private readonly approved = signal<StudentRequirements | null>(null);

  protected readonly groups = computed(() => {
    const files = this.files() ?? [];
    const known = new Set(REQUIREMENT_TYPES.map((type) => type.code));
    const groups = REQUIREMENT_TYPES.map((type) => ({
      label: type.label,
      approved: !!this.approved()?.[type.field],
      files: files.filter((file) => file.submission_name === type.code),
    }));
    // Files saved under a name the requirements check doesn't know (an old upload bug).
    const other = files.filter((file) => !known.has(file.submission_name ?? ''));
    if (other.length > 0) {
      groups.push({ label: 'Other uploads', approved: false, files: other });
    }
    return groups.map((group) => ({ ...group, pending: group.files.filter((f) => f.advisor_approval === 'Pending').length }));
  });
  protected readonly approvedCount = computed(() => this.groups().filter((g) => g.approved).length);

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
    const id = this.review.studentId();
    this.submissionApi.list('submissions', id).subscribe({
      next: (res) => this.files.set([...res.payload].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))),
      error: () => this.files.set([]),
    });
    this.studentApi.requirements(id).subscribe((res) => this.approved.set(res.payload[0] ?? null));
  }
}
