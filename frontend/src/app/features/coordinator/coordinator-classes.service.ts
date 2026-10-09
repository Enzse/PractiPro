import { Injectable, inject, signal } from '@angular/core';
import { SessionService } from '../../core/auth/session.service';
import { ClassService } from '../../core/api/class.service';
import { ClassProfile } from '../../core/models/class';

/**
 * The classes the signed-in coordinator handles. Provided by the coordinator
 * layout, so it is created at sign-in and discarded at sign-out.
 */
@Injectable()
export class CoordinatorClassesService {
  private readonly classApi = inject(ClassService);
  readonly coordinatorId = inject(SessionService).requireUserId();

  private readonly list = signal<ClassProfile[] | null>(null);
  /** null until loaded. */
  readonly classes = this.list.asReadonly();

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.classApi.ofCoordinator(this.coordinatorId).subscribe({
      next: (res) => this.list.set(res.payload ?? []),
      // 404 means no classes yet.
      error: () => this.list.set([]),
    });
  }
}
