import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { StudentService } from '../../../core/api/student.service';
import { StudentOjtStatus } from '../../../core/models/student';
import { matchesSearch } from '../../../shared/utils/search';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field/search-field.component';
import { FilterChipsComponent, FilterOption } from '../../../shared/ui/filter-chips/filter-chips.component';
import { AddToClassDialogComponent } from './add-to-class-dialog.component';
import { StudentDetailDialogComponent } from './student-detail-dialog.component';

const PAGE_SIZE = 15;

/** Every student, with their class and progress; students can be put in classes in bulk. */
@Component({
  selector: 'app-students',
  imports: [DecimalPipe, NgxPaginationModule, PageHeaderComponent, IconComponent, EmptyStateComponent, SearchFieldComponent, FilterChipsComponent],
  templateUrl: './students.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentsComponent implements OnInit {
  private readonly studentApi = inject(StudentService);
  private readonly dialog = inject(MatDialog);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly students = signal<StudentOjtStatus[] | null>(null);
  protected readonly search = signal('');
  protected readonly filter = signal('all');
  protected readonly selected = signal<Set<number>>(new Set());
  protected page = 1;

  protected readonly filterOptions = computed<FilterOption[]>(() => {
    const list = this.students() ?? [];
    const programs = [...new Set(list.map((s) => s.program).filter((p): p is string => !!p))].sort();
    return [
      { value: 'all', label: 'All', count: list.length },
      { value: 'no-class', label: 'No class', count: list.filter((s) => !s.block).length },
      ...programs.map((p) => ({ value: p, label: p, count: list.filter((s) => s.program === p).length })),
    ];
  });

  protected readonly visible = computed(() => {
    const filter = this.filter();
    return (this.students() ?? [])
      .filter((s) => filter === 'all' || (filter === 'no-class' ? !s.block : s.program === filter))
      .filter((s) => matchesSearch({ name: `${s.firstName} ${s.lastName}`, id: s.studentId, block: s.block, email: s.email }, this.search()));
  });

  protected readonly allVisibleSelected = computed(() => this.visible().length > 0 && this.visible().every((s) => this.selected().has(s.id)));

  ngOnInit(): void {
    this.load();
  }

  protected toggle(id: number): void {
    this.selected.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected toggleAll(): void {
    const all = this.allVisibleSelected();
    this.selected.update((set) => {
      const next = new Set(set);
      for (const s of this.visible()) {
        all ? next.delete(s.id) : next.add(s.id);
      }
      return next;
    });
  }

  protected addToClass(): void {
    const chosen = (this.students() ?? []).filter((s) => this.selected().has(s.id));
    this.dialog
      .open(AddToClassDialogComponent, { data: chosen, panelClass: 'app-dialog', width: '560px' })
      .afterClosed()
      .subscribe((moved) => {
        if (moved) {
          this.selected.set(new Set());
          this.load();
        }
      });
  }

  protected open(student: StudentOjtStatus): void {
    this.dialog
      .open(StudentDetailDialogComponent, { data: student, panelClass: 'app-dialog', width: '720px' })
      .afterClosed()
      .subscribe(() => this.load());
  }

  protected hours(s: StudentOjtStatus): number {
    return Number(s.TotalHoursWorked ?? 0);
  }

  private load(): void {
    this.studentApi.allOjtStatus().subscribe({
      next: (res) => this.students.set([...res.payload].sort((a, b) => a.lastName.localeCompare(b.lastName))),
      error: () => this.students.set([]),
    });
  }
}
