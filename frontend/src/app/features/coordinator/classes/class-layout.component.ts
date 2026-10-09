import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ClassContextService } from '../class-context.service';
import { CoordinatorClassesService } from '../coordinator-classes.service';

/** Wraps the pages of one class, providing them its ClassContextService. */
@Component({
  selector: 'app-class-layout',
  imports: [RouterOutlet, RouterLink, EmptyStateComponent],
  template: `
    @if (unknownClass()) {
      <section class="card">
        <app-empty-state icon="users-three:duotone" [title]="'You don’t handle ' + context.block()"
          description="It may have been reassigned, or the link has a typo.">
          <a routerLink="/coordinator/classes" class="btn btn-primary">See your classes</a>
        </app-empty-state>
      </section>
    } @else {
      <router-outlet />
    }
  `,
  providers: [ClassContextService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassLayoutComponent {
  protected readonly context = inject(ClassContextService);
  private readonly classes = inject(CoordinatorClassesService);

  protected readonly unknownClass = computed(() => {
    const list = this.classes.classes();
    return list !== null && !list.some((item) => item.block_name === this.context.block());
  });
}
