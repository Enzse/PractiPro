import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { StudentService } from '../../../core/api/student.service';
import { StudentOjtStatus } from '../../../core/models/student';
import { matchesSearch } from '../../../shared/utils/search';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { FilterChipsComponent, FilterOption } from '../../../shared/ui/filter-chips/filter-chips.component';
import { ClassContextService, REVIEW_KINDS } from '../class-context.service';
import { STUDENT_FILTERS, SEMINAR_HOURS, TRAINING_HOURS } from './student-filters';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-student-list',
  imports: [DecimalPipe, RouterLink, NgxPaginationModule, PageHeaderComponent, IconComponent, EmptyStateComponent, SearchFieldComponent, FilterChipsComponent],
  templateUrl: './student-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentListComponent {
  protected readonly context = inject(ClassContextService);
  private readonly studentApi = inject(StudentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly trainingHours = TRAINING_HOURS;
  protected readonly seminarHours = SEMINAR_HOURS;
  protected readonly pageSize = PAGE_SIZE;
  protected readonly students = signal<StudentOjtStatus[] | null>(null);
  protected readonly search = signal('');
  protected page = 1;

  /** The filter and review kind come from the URL, so other pages can link to a filtered list. */
  private readonly query = toSignal(this.route.queryParamMap.pipe(map((q) => ({ show: q.get('show') ?? 'all', kind: q.get('kind') }))), {
    requireSync: true,
  });
  protected readonly show = computed(() => this.query().show);
  protected readonly kind = computed(() => REVIEW_KINDS.find((k) => k.key === this.query().kind) ?? null);

  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const list = this.students() ?? [];
    return [
      { value: 'all', label: 'All', count: list.length },
      { value: 'needs-review', label: 'Needs review', count: list.filter((s) => this.pending(s) > 0).length },
      ...STUDENT_FILTERS.map((f) => ({ value: f.value, label: f.chip ?? f.label, count: list.filter(f.matches).length })),
    ];
  });

  protected readonly visible = computed(() => {
    const show = this.show();
    const kind = this.kind();
    const filter = STUDENT_FILTERS.find((f) => f.value === show);
    return (this.students() ?? [])
      .filter((s) => {
        if (show === 'needs-review') {
          return kind ? Number(this.context.pendingByStudent().get(s.id)?.[kind.key] ?? 0) > 0 : this.pending(s) > 0;
        }
        return filter ? filter.matches(s) : true;
      })
      .filter((s) => matchesSearch({ name: `${s.firstName} ${s.lastName}`, id: s.studentId, company: s.company_name }, this.search()))
      .sort((a, b) => this.pending(b) - this.pending(a) || a.lastName.localeCompare(b.lastName));
  });

  constructor() {
    effect(() => {
      const block = this.context.block();
      this.students.set(null);
      this.studentApi.inClass(block).subscribe({
        next: (res) => this.students.set(res.payload),
        error: () => this.students.set([]),
      });
    });
  }

  protected pending(student: StudentOjtStatus): number {
    return this.context.pendingFor(student.id);
  }

  protected setFilter(show: string): void {
    this.page = 1;
    this.router.navigate([], { relativeTo: this.route, queryParams: { show: show === 'all' ? null : show, kind: null }, replaceUrl: true });
  }

  protected clearKind(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { kind: null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  /** Opens on the tab that needs attention: the filtered review kind, else the first pending one. */
  protected linkFor(student: StudentOjtStatus): string[] {
    const row = this.context.pendingByStudent().get(student.id);
    const pendingTab = REVIEW_KINDS.find((k) => Number(row?.[k.key] ?? 0) > 0)?.tab;
    const tab = this.kind()?.tab ?? pendingTab ?? (student.registration_status === 1 ? 'attendance' : 'requirements');
    return [String(student.id), tab];
  }

  protected stage(student: StudentOjtStatus): { label: string; badge: string } {
    if (STUDENT_FILTERS.find((f) => f.value === 'completed')!.matches(student)) {
      return { label: 'Completed', badge: 'badge-success' };
    }
    if (student.registration_status !== 1) {
      return { label: 'Registering', badge: 'badge-neutral' };
    }
    if (!student.company_id) {
      return { label: 'Not placed', badge: 'badge-warning' };
    }
    return { label: 'In practicum', badge: 'badge-brand' };
  }

  protected initials(student: StudentOjtStatus): string {
    return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
  }

  protected hours(value: string | null): number {
    return Number(value ?? 0);
  }
}
