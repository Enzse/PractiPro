import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../../core/api/report.service';
import { PerformanceEvaluation } from '../../../../core/models/records';
import { EvaluationAnswersComponent } from '../../../../shared/practicum/evaluation-answers.component';
import { COMMENT_QUESTIONS, OVERALL_RATINGS, RATED_SECTIONS, RECOMMEND_QUESTION } from '../../../../shared/practicum/evaluation-questions';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../../shared/ui/confirm/confirm.service';
import { EVALUATION_HOURS, SupervisorContextService } from '../../supervisor-context.service';
import { TraineeContextService } from '../trainee-context.service';

/** Every question of the evaluation, all required. */
function buildForm(): FormGroup<Record<string, FormControl<string>>> {
  const keys = [
    ...RATED_SECTIONS.flatMap((section) => section.items.map((item) => item.key)),
    'p4q1',
    ...COMMENT_QUESTIONS.map((q) => q.key),
    RECOMMEND_QUESTION.key,
    RECOMMEND_QUESTION.reasonKey,
  ];
  return new FormGroup(Object.fromEntries(keys.map((key) => [key, new FormControl('', { nonNullable: true, validators: Validators.required })])));
}

/** The supervisor's performance evaluation: a form until submitted, then the answers. */
@Component({
  selector: 'app-evaluation-tab',
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, IconComponent, EmptyStateComponent, StatusBadgeComponent, EvaluationAnswersComponent],
  templateUrl: './evaluation-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationTabComponent {
  protected readonly trainee = inject(TraineeContextService);
  private readonly supervisor = inject(SupervisorContextService);
  private readonly reportApi = inject(ReportService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly el = inject(ElementRef<HTMLElement>);

  protected readonly sections = RATED_SECTIONS;
  protected readonly overallOptions = OVERALL_RATINGS;
  protected readonly comments = COMMENT_QUESTIONS;
  protected readonly recommend = RECOMMEND_QUESTION;
  protected readonly requiredHours = EVALUATION_HOURS;

  protected readonly evaluation = signal<PerformanceEvaluation | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly attempted = signal(false);
  protected readonly form = buildForm();

  protected readonly hours = computed(() => Number(this.trainee.trainee()?.TotalHoursWorked ?? 0));
  protected readonly eligible = computed(() => this.hours() >= EVALUATION_HOURS);

  constructor() {
    effect(() => {
      this.trainee.studentId();
      this.load();
    });
  }

  protected missing(key: string): boolean {
    return this.attempted() && this.form.controls[key].invalid;
  }

  protected submit(): void {
    this.attempted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('A few questions are unanswered', 'They’re highlighted below.');
      setTimeout(() => this.el.nativeElement.querySelector('[data-missing="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    const name = this.trainee.trainee()?.firstName ?? 'the trainee';
    this.confirm
      .ask({
        title: `Submit your evaluation of ${name}?`,
        message: 'You can’t change it after submitting. The student’s coordinator reviews it next.',
        confirmText: 'Submit evaluation',
      })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.submitting.set(true);
        const evaluation: PerformanceEvaluation = {
          supervisor_id: this.supervisor.supervisorId,
          student_id: this.trainee.studentId(),
          ...this.form.getRawValue(),
        };
        this.reportApi.createEvaluation(evaluation).subscribe({
          next: () => {
            this.submitting.set(false);
            this.toast.success('Evaluation submitted', 'The coordinator will review it.');
            this.load();
            this.trainee.changed();
          },
          error: () => {
            this.submitting.set(false);
            this.toast.error('Couldn’t submit the evaluation', 'Please try again.');
          },
        });
      });
  }

  private load(): void {
    this.reportApi.evaluationOf(this.trainee.studentId()).subscribe({
      next: (res) => {
        this.evaluation.set(res.payload[0] ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
