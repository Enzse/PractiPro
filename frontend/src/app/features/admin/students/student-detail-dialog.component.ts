import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StudentService } from '../../../core/api/student.service';
import { SubmissionService } from '../../../core/api/submission.service';
import { SubmittedFile } from '../../../core/models/records';
import { StudentOjtStatus, StudentRequirements } from '../../../core/models/student';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { REQUIREMENT_TYPES, requirementLabel } from '../../../shared/practicum/requirement-types';
import { FileReviewListComponent } from '../../../shared/practicum/file-review-list.component';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';

/** A student's details, requirement checklist and uploaded requirements. */
@Component({
  selector: 'app-student-detail-dialog',
  imports: [DecimalPipe, OrdinalPipe, DialogShellComponent, IconComponent, FileReviewListComponent],
  template: `
    <app-dialog-shell [title]="s.firstName + ' ' + s.lastName" [description]="s.email" icon="student">
      <dl class="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-4">
        <div>
          <dt class="text-xs text-slate-500">Student ID</dt>
          <dd class="mt-0.5 font-medium text-slate-900">{{ s.studentId || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-500">Program</dt>
          <dd class="mt-0.5 font-medium text-slate-900">{{ s.program || '—' }}@if (s.year) { · {{ s.year | ordinal }} }</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-500">Class</dt>
          <dd class="mt-0.5 font-medium text-slate-900">{{ s.block || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs text-slate-500">Approved hours</dt>
          <dd class="mt-0.5 font-medium text-slate-900">{{ hours() | number: '1.0-0' }} / 200</dd>
        </div>
        <div class="col-span-2">
          <dt class="text-xs text-slate-500">Company</dt>
          <dd class="mt-0.5 font-medium text-slate-900">{{ s.company_name || 'Not placed yet' }}</dd>
        </div>
        <div class="col-span-2">
          <dt class="text-xs text-slate-500">Phone</dt>
          <dd class="mt-0.5 font-medium text-slate-900">{{ s.phoneNumber || '—' }}</dd>
        </div>
      </dl>

      <div class="mt-6 flex items-baseline justify-between">
        <h3 class="text-sm font-semibold text-slate-900">Requirements</h3>
        <span class="text-xs text-slate-500">{{ approvedCount() }} of {{ checklist().length }} approved</span>
      </div>
      <ul class="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
        @for (item of checklist(); track item.label) {
          <li class="flex items-center gap-2 text-sm" [class]="item.approved ? 'text-slate-900' : 'text-slate-500'">
            @if (item.approved) {
              <app-icon name="check-circle" [size]="16" class="text-emerald-600" />
            } @else {
              <span class="ml-px h-[14px] w-[14px] rounded-full border border-dashed border-slate-300"></span>
            }
            {{ item.label }}
          </li>
        }
      </ul>

      @if (files().length > 0) {
        <h3 class="mt-6 text-sm font-semibold text-slate-900">Uploaded files</h3>
        <div class="-mx-6 mt-2 border-y border-slate-100">
          @for (group of grouped(); track group.label) {
            <p class="bg-slate-50/60 px-6 py-1.5 text-xs font-medium text-slate-600">{{ group.label }}</p>
            <app-file-review-list [files]="group.files" table="submissions" commentsTable="comments_requirements" (changed)="load()" />
          }
        </div>
      }
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDetailDialogComponent implements OnInit {
  protected readonly s = inject<StudentOjtStatus>(MAT_DIALOG_DATA);
  private readonly studentApi = inject(StudentService);
  private readonly submissionApi = inject(SubmissionService);

  private readonly requirements = signal<StudentRequirements | null>(null);
  protected readonly files = signal<SubmittedFile[]>([]);

  protected readonly checklist = computed(() =>
    REQUIREMENT_TYPES.map((type) => ({ label: type.label, approved: !!this.requirements()?.[type.field] })),
  );
  protected readonly approvedCount = computed(() => this.checklist().filter((c) => c.approved).length);
  protected readonly grouped = computed(() => {
    const groups = new Map<string, SubmittedFile[]>();
    for (const file of this.files()) {
      const label = requirementLabel(file.submission_name);
      groups.set(label, [...(groups.get(label) ?? []), file]);
    }
    return [...groups.entries()].map(([label, files]) => ({ label, files }));
  });

  ngOnInit(): void {
    this.load();
  }

  protected hours(): number {
    return Number(this.s.TotalHoursWorked ?? 0);
  }

  protected load(): void {
    this.studentApi.requirements(this.s.id).subscribe((res) => this.requirements.set(res.payload[0] ?? null));
    this.submissionApi.list('submissions', this.s.id).subscribe({
      next: (res) => this.files.set([...res.payload].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))),
      error: () => this.files.set([]),
    });
  }
}
