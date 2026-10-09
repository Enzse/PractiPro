import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClassService } from '../../../core/api/class.service';
import { Coordinator } from '../../../core/models/class';
import { matchesSearch } from '../../../shared/utils/search';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { FilterChipsComponent, FilterOption } from '../../../shared/ui/filter-chips/filter-chips.component';
import { CoordinatorDialogComponent } from './coordinator-dialog.component';

/** Practicum coordinators, their departments and how many classes each handles. */
@Component({
  selector: 'app-coordinators',
  imports: [PageHeaderComponent, IconComponent, EmptyStateComponent, SearchFieldComponent, FilterChipsComponent],
  template: `
    <app-page-header title="Coordinators" description="Assign coordinators to departments and classes. New coordinators sign up themselves and are approved under Accounts." />

    <section class="card overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6">
        <div class="w-full sm:w-80"><app-search-field [(value)]="search" placeholder="Search name or email" /></div>
        <app-filter-chips [options]="filterOptions()" [(value)]="filter" label="Filter by department" />
      </div>

      @if (coordinators() === null) {
        <div class="space-y-3 p-6">
          <div class="skeleton h-12"></div>
          <div class="skeleton h-12"></div>
        </div>
      } @else if (visible().length === 0) {
        <app-empty-state icon="chalkboard-teacher:duotone" title="No coordinators match" [compact]="true" />
      } @else {
        <ul class="divide-y divide-slate-100">
          @for (c of visible(); track c.id) {
            <li>
              <button type="button" class="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50/60 sm:px-6" (click)="open(c)">
                <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold uppercase text-brand-700">
                  {{ c.first_name.charAt(0) }}{{ c.last_name.charAt(0) }}
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium text-slate-900">{{ c.first_name }} {{ c.last_name }}</span>
                  <span class="block truncate text-xs text-slate-500">{{ c.email }}</span>
                </span>
                <span class="badge badge-neutral hidden sm:inline-flex">{{ c.department || 'No department' }}</span>
                <span class="w-20 text-right text-sm text-slate-600">{{ c.number_of_classes }} {{ c.number_of_classes === 1 ? 'class' : 'classes' }}</span>
                <app-icon name="caret-right" [size]="16" class="text-slate-300 group-hover:text-brand-700" />
              </button>
            </li>
          }
        </ul>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoordinatorsComponent implements OnInit {
  private readonly classApi = inject(ClassService);
  private readonly dialog = inject(MatDialog);

  protected readonly coordinators = signal<Coordinator[] | null>(null);
  protected readonly search = signal('');
  protected readonly filter = signal('all');

  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const list = this.coordinators() ?? [];
    const departments = [...new Set(list.map((c) => c.department).filter((d): d is string => !!d))].sort();
    return [
      { value: 'all', label: 'All', count: list.length },
      ...departments.map((d) => ({ value: d, label: d, count: list.filter((c) => c.department === d).length })),
    ];
  });
  protected readonly visible = computed(() =>
    (this.coordinators() ?? [])
      .filter((c) => this.filter() === 'all' || c.department === this.filter())
      .filter((c) => matchesSearch({ name: `${c.first_name} ${c.last_name}`, email: c.email }, this.search())),
  );

  ngOnInit(): void {
    this.load();
  }

  protected open(coordinator: Coordinator): void {
    this.dialog
      .open(CoordinatorDialogComponent, { data: coordinator, panelClass: 'app-dialog', width: '560px' })
      .afterClosed()
      .subscribe(() => this.load());
  }

  private load(): void {
    this.classApi.coordinators().subscribe({
      next: (res) => this.coordinators.set([...res.payload].sort((a, b) => a.last_name.localeCompare(b.last_name))),
      error: () => this.coordinators.set([]),
    });
  }
}
