import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClassJoinService } from '../../../core/api/class-join.service';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ClassContextService, REVIEW_KINDS } from '../class-context.service';
import { STUDENT_FILTERS } from '../students/student-filters';

@Component({
  selector: 'app-class-overview',
  imports: [RouterLink, MatTooltipModule, OrdinalPipe, PageHeaderComponent, IconComponent],
  templateUrl: './class-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassOverviewComponent {
  protected readonly context = inject(ClassContextService);
  private readonly classJoinApi = inject(ClassJoinService);

  protected readonly requestCount = signal(0);
  protected readonly invitationCount = signal(0);

  /** How many students have reached each stage, in order. */
  protected readonly stages = computed(() => {
    const p = this.context.profile();
    if (!p) {
      return [];
    }
    const total = p.students_handled || 0;
    const counts: Record<string, number> = {
      registered: p.registered_students,
      placed: p.hired_students,
      hours: p.ojt_cleared_students,
      seminars: p.seminar_cleared_students,
      evaluated: p.evaluation_cleared_students,
      'final-report': p.exitpoll_cleared_students,
      completed: p.practicum_completed_students,
    };
    return STUDENT_FILTERS.filter((f) => f.value in counts).map((f) => {
      const count = Number(counts[f.value] ?? 0);
      return { ...f, count, total, percent: total ? Math.round((count / total) * 100) : 0 };
    });
  });

  protected readonly reviews = computed(() => {
    const totals = this.context.pendingTotals();
    return REVIEW_KINDS.map((kind) => ({ ...kind, count: Number(totals?.[kind.key] ?? 0) }));
  });

  constructor() {
    effect(() => {
      const block = this.context.block();
      this.classJoinApi.requestCountForClass(block).subscribe((res) => this.requestCount.set(Number(res.payload[0]?.requestCount ?? 0)));
      this.classJoinApi.invitationCountForClass(block).subscribe((res) => this.invitationCount.set(Number(res.payload[0]?.invitationCount ?? 0)));
    });
  }
}
