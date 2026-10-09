import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { IconName } from '../../../shared/ui/icon/icons.generated';
import { ClassContextService, ReviewKind } from '../class-context.service';
import { SEMINAR_HOURS, TRAINING_HOURS } from '../students/student-filters';
import { StudentReviewContextService } from './student-review-context.service';

const TABS: { path: string; label: string; icon: IconName; pending?: ReviewKind }[] = [
  { path: 'requirements', label: 'Requirements', icon: 'clipboard-text', pending: 'pending_req_count' },
  { path: 'attendance', label: 'Attendance', icon: 'clock' },
  { path: 'weekly-reports', label: 'Weekly reports', icon: 'note-pencil', pending: 'pending_war_count_advisor' },
  { path: 'documentation', label: 'Documentation', icon: 'notebook', pending: 'pending_doc_count' },
  { path: 'seminars', label: 'Seminars', icon: 'chalkboard-teacher', pending: 'pending_sem_count' },
  { path: 'evaluation', label: 'Evaluation', icon: 'medal', pending: 'pending_sse_count' },
  { path: 'final-report', label: 'Final report', icon: 'seal-check', pending: 'pending_frp_count' },
];

/** One student's work, a tab per kind of submission, with approval controls. */
@Component({
  selector: 'app-student-review',
  imports: [DecimalPipe, RouterLink, RouterLinkActive, RouterOutlet, OrdinalPipe, IconComponent],
  templateUrl: './student-review.component.html',
  providers: [StudentReviewContextService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentReviewComponent {
  protected readonly review = inject(StudentReviewContextService);
  private readonly classContext = inject(ClassContextService);

  protected readonly trainingHours = TRAINING_HOURS;
  protected readonly seminarHours = SEMINAR_HOURS;

  protected readonly tabs = computed(() => {
    const row = this.classContext.pendingByStudent().get(this.review.studentId());
    return TABS.map((tab) => ({ ...tab, count: tab.pending ? Number(row?.[tab.pending] ?? 0) : 0 }));
  });

  protected readonly initials = computed(() => {
    const s = this.review.student();
    return s ? `${s.firstName.charAt(0)}${s.lastName.charAt(0)}`.toUpperCase() : '';
  });

  constructor() {
    // On narrow screens the tab bar scrolls; keep the current tab in view.
    const host = inject(ElementRef<HTMLElement>);
    const reveal = () => host.nativeElement.querySelector('nav [aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
    effect(() => this.review.student() && setTimeout(reveal));
    inject(Router).events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => setTimeout(reveal));
  }

  protected hours(value: string | null | undefined): number {
    return Number(value ?? 0);
  }
}
