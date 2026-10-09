import { ChangeDetectionStrategy, Component, ElementRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../core/api/report.service';
import { FinalReport } from '../../../core/models/records';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { StudentStatusService } from '../student-status.service';
import { CRITERIA, EXTENTS, OBJECTIVES, RATINGS } from './final-report-questions';

@Component({
  selector: 'app-final-report',
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent, IconComponent, StatusBadgeComponent],
  templateUrl: './final-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalReportComponent implements OnInit {
  private readonly status = inject(StudentStatusService);
  private readonly reportApi = inject(ReportService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly criteria = CRITERIA;
  protected readonly objectives = OBJECTIVES;
  protected readonly extents = EXTENTS;
  protected readonly ratings = RATINGS;

  protected readonly report = signal<FinalReport | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  /** Set on the first submit attempt, so unanswered questions are only flagged after that. */
  protected readonly attempted = signal(false);

  protected readonly form = this.fb.group({
    user_id: this.status.studentId,
    p1q1: ['', Validators.required],
    p1q2: ['', Validators.required],
    p1q3: ['', Validators.required],
    p1q4: ['', Validators.required],
    p1q5: ['', Validators.required],
    p1q6: ['', Validators.required],
    p1q7: ['', Validators.required],
    // Nullable on purpose: answering "no" to p1q7 resets these to null, which the
    // final-report analytics count as "None".
    p1q7x1: new FormControl<string | null>(''),
    p1q7x2: new FormControl<string | null>(''),

    p2q1: ['', Validators.required],
    p2q1x1: ['', Validators.required],
    p2q2: ['', Validators.required],
    p2q2x1: ['', Validators.required],
    p2q3: ['', Validators.required],
    p2q3x1: ['', Validators.required],
    p2q4: ['', Validators.required],
    p2q4x1: ['', Validators.required],
    p2q5: ['', Validators.required],
    p2q5x1: ['', Validators.required],

    p3q1: ['', Validators.required],
    p4q1: ['', Validators.required],
  });

  constructor() {
    this.form.controls.p1q7.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (value === 'no') {
        this.form.controls.p1q7x1.reset(null);
        this.form.controls.p1q7x2.reset(null);
      }
    });
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.reportApi.finalReportOf(this.status.studentId).subscribe({
      next: (res) => {
        this.report.set(res.payload[0] ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  /** Whether a question should be flagged as unanswered. */
  protected missing(key: string): boolean {
    return this.attempted() && this.form.get(key)!.invalid;
  }

  protected answer(key: string): string {
    const value = this.report()?.[key];
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }

  protected submit(): void {
    this.attempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('A few questions are unanswered', 'They’re highlighted below.');
      setTimeout(() => this.el.nativeElement.querySelector('[data-missing="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    this.confirm
      .ask({
        title: 'Submit your final report?',
        message: 'You can’t change your answers after submitting, so check them first.',
        confirmText: 'Submit report',
      })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.submitting.set(true);
        this.reportApi.createFinalReport(this.form.getRawValue()).subscribe({
          next: () => {
            this.toast.success('Final report submitted', 'Your coordinator will review it.');
            this.submitting.set(false);
            this.load();
            this.status.refresh();
          },
          error: () => {
            this.submitting.set(false);
            this.toast.error('Couldn’t submit the report', 'Please try again.');
          },
        });
      });
  }
}
