import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClassProfile } from '../../../core/models/class';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { CoordinatorClassesService } from '../coordinator-classes.service';

/** The coordinator's classes, each with how far its students have come. */
@Component({
  selector: 'app-class-list',
  imports: [RouterLink, OrdinalPipe, PageHeaderComponent, IconComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Your classes" description="Pick a class to review its students’ work and track their practicum." />

    @if (classes.classes() === null) {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (card of [1, 2, 3]; track card) {
          <div class="skeleton h-52 rounded-2xl"></div>
        }
      </div>
    } @else if (classes.classes()!.length === 0) {
      <section class="card">
        <app-empty-state icon="users-three:duotone" title="No classes yet"
          description="An administrator assigns classes to coordinators. Once you have one, it shows up here." />
      </section>
    } @else {
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (item of classes.classes(); track item.block_name) {
          <li>
            <a [routerLink]="['/coordinator/classes', item.block_name, 'overview']"
              class="card group flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-raised">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h2 class="font-display text-xl font-semibold tracking-[-0.01em] text-slate-900">{{ item.block_name }}</h2>
                  <p class="text-sm text-slate-500">{{ item.course }} · {{ item.year_level | ordinal }} year</p>
                </div>
                <app-icon name="arrow-right" [size]="18" class="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-700" />
              </div>

              <p class="mt-5 text-sm text-slate-600">
                <span class="font-display text-2xl font-semibold text-slate-900">{{ item.students_handled }}</span>
                {{ item.students_handled === 1 ? 'student' : 'students' }}
              </p>

              <dl class="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                @for (stat of stats(item); track stat.label) {
                  <div>
                    <dt class="text-[11px] text-slate-500">{{ stat.label }}</dt>
                    <dd class="text-sm font-semibold text-slate-900">{{ stat.value }}</dd>
                  </div>
                }
              </dl>
            </a>
          </li>
        }
      </ul>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassListComponent {
  protected readonly classes = inject(CoordinatorClassesService);

  protected stats(item: ClassProfile) {
    return [
      { label: 'Registered', value: item.registered_students },
      { label: 'Placed', value: item.hired_students },
      { label: 'Completed', value: item.practicum_completed_students },
    ];
  }
}
