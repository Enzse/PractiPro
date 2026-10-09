import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '../../../core/api/student.service';
import { StudentOjtStatus } from '../../../core/models/student';
import { ClassContextService } from '../class-context.service';

/**
 * The student being reviewed (from /students/:studentId), shared by the review
 * page and its tabs. Provided by the review page.
 */
@Injectable()
export class StudentReviewContextService {
  private readonly studentApi = inject(StudentService);
  private readonly classContext = inject(ClassContextService);

  readonly studentId = signal(0);
  private readonly state = signal<StudentOjtStatus | null>(null);
  readonly student = this.state.asReadonly();

  constructor() {
    inject(ActivatedRoute).paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.studentId.set(Number(params.get('studentId')));
      this.state.set(null);
      this.loadStudent();
    });
  }

  /** Call after approving something: refreshes the student's totals and the class's pending counts. */
  changed(): void {
    this.loadStudent();
    this.classContext.refresh();
  }

  private loadStudent(): void {
    this.studentApi.ojtStatus(this.studentId()).subscribe((res) => this.state.set(res.payload[0] ?? null));
  }
}
