import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { SupervisorContextService } from '../supervisor-context.service';

/** The trainee being viewed (from /trainees/:studentId). Provided by the trainee page. */
@Injectable()
export class TraineeContextService {
  private readonly supervisor = inject(SupervisorContextService);

  readonly studentId = signal(0);
  /** null while loading; undefined if this student isn't one of the supervisor's trainees. */
  readonly trainee = computed(() => {
    const list = this.supervisor.trainees();
    return list === null ? null : list.find((t) => t.id === this.studentId());
  });
  readonly work = computed(() => this.supervisor.workFor(this.studentId()));

  constructor() {
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed()).subscribe((params) => this.studentId.set(Number(params.get('studentId'))));
  }

  /** Call after approving something, so pending counts update. */
  changed(): void {
    this.supervisor.refresh();
  }
}
