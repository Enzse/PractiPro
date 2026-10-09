import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, forkJoin, map, of } from 'rxjs';
import { ClassService } from '../../../core/api/class.service';
import { ClassProfile } from '../../../core/models/class';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { matchesSearch } from '../../../shared/utils/search';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { FilterChipsComponent, FilterOption } from '../../../shared/ui/filter-chips/filter-chips.component';
import { ClassDialogComponent } from './class-dialog.component';
import { NewClassDialogComponent } from './new-class-dialog.component';

/** Every class (block), with its coordinator and size. */
@Component({
  selector: 'app-classes',
  imports: [OrdinalPipe, PageHeaderComponent, IconComponent, EmptyStateComponent, SearchFieldComponent, FilterChipsComponent],
  template: `
    <app-page-header title="Classes" description="Practicum classes (blocks). Students join the class for their program and year.">
      <button pageActions type="button" class="btn btn-primary" (click)="create()"><app-icon name="plus" [size]="16" /> New class</button>
    </app-page-header>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <app-filter-chips [options]="filterOptions()" [(value)]="filter" label="Filter by program" />
      <div class="w-full sm:w-64"><app-search-field [(value)]="search" placeholder="Search classes" /></div>
    </div>

    @if (classes() === null) {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (card of [1, 2, 3]; track card) {
          <div class="skeleton h-40 rounded-2xl"></div>
        }
      </div>
    } @else if (visible().length === 0) {
      <section class="card">
        <app-empty-state icon="users-three:duotone" [title]="classes()!.length === 0 ? 'No classes yet' : 'No classes match'"
          [description]="classes()!.length === 0 ? 'Create a class for each practicum block.' : 'Try another search or filter.'" />
      </section>
    } @else {
      <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (c of visible(); track c.block_name) {
          <li>
            <button type="button" class="card flex h-full w-full flex-col p-5 text-left transition hover:-translate-y-0.5 hover:shadow-raised" (click)="open(c)">
              <div class="flex w-full items-start justify-between gap-3">
                <div>
                  <h2 class="font-display text-xl font-semibold tracking-[-0.01em] text-slate-900">{{ c.block_name }}</h2>
                  <p class="text-sm text-slate-500">{{ c.course }} · {{ c.year_level | ordinal }} year{{ c.department ? ' · ' + c.department : '' }}</p>
                </div>
                <span class="text-sm text-slate-600"><span class="font-semibold text-slate-900">{{ c.students_handled }}</span> {{ c.students_handled === 1 ? 'student' : 'students' }}</span>
              </div>
              <p class="mt-auto flex items-center gap-2 pt-5 text-sm" [class]="c.c_first_name ? 'text-slate-600' : 'text-amber-700'">
                <app-icon [name]="c.c_first_name ? 'chalkboard-teacher' : 'warning-circle'" [size]="16" />
                {{ c.c_first_name ? c.c_first_name + ' ' + c.c_last_name : 'No coordinator yet' }}
              </p>
            </button>
          </li>
        }
      </ul>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassesComponent implements OnInit {
  private readonly classApi = inject(ClassService);
  private readonly dialog = inject(MatDialog);

  protected readonly classes = signal<ClassProfile[] | null>(null);
  protected readonly search = signal('');
  protected readonly filter = signal('all');

  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const list = this.classes() ?? [];
    const programs = [...new Set(list.map((c) => c.course))].sort();
    return [
      { value: 'all', label: 'All', count: list.length },
      { value: 'no-coordinator', label: 'No coordinator', count: list.filter((c) => !c.c_first_name).length },
      ...programs.map((p) => ({ value: p, label: p, count: list.filter((c) => c.course === p).length })),
    ];
  });
  protected readonly visible = computed(() =>
    (this.classes() ?? [])
      .filter((c) => this.filter() === 'all' || (this.filter() === 'no-coordinator' ? !c.c_first_name : c.course === this.filter()))
      .filter((c) => matchesSearch({ block: c.block_name, coordinator: `${c.c_first_name ?? ''} ${c.c_last_name ?? ''}` }, this.search())),
  );

  ngOnInit(): void {
    this.load();
  }

  protected create(): void {
    this.dialog
      .open(NewClassDialogComponent, { panelClass: 'app-dialog', width: '480px' })
      .afterClosed()
      .subscribe((created) => created && this.load());
  }

  protected open(c: ClassProfile): void {
    this.dialog.open(ClassDialogComponent, { data: c, panelClass: 'app-dialog', width: '560px' });
  }

  /** The class list has no totals; each class's profile adds its coordinator and numbers. */
  private load(): void {
    this.classApi.all().subscribe({
      next: (res) => {
        if (res.payload.length === 0) {
          this.classes.set([]);
          return;
        }
        forkJoin(
          res.payload.map((block) =>
            this.classApi.profile(block.block_name).pipe(
              map((profile) => profile.payload[0] ?? null),
              catchError(() => of(null)),
            ),
          ),
        ).subscribe((profiles) =>
          this.classes.set(profiles.filter((p): p is ClassProfile => p !== null).sort((a, b) => a.block_name.localeCompare(b.block_name))),
        );
      },
      error: () => this.classes.set([]),
    });
  }
}
