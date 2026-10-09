import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../../core/api/student.service';
import { ClassProfile } from '../../../core/models/class';
import { StudentOjtStatus } from '../../../core/models/student';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

/** One class: its coordinator, progress and students. */
@Component({
  selector: 'app-class-dialog',
  imports: [RouterLink, OrdinalPipe, DialogShellComponent, EmptyStateComponent],
  template: `
    <app-dialog-shell [title]="c.block_name" [description]="c.course + ' · ' + (c.year_level | ordinal) + ' year' + (c.department ? ' · ' + c.department : '')" icon="users-three">
      <dl class="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 text-center">
        @for (stat of stats; track stat.label) {
          <div>
            <dt class="text-xs text-slate-500">{{ stat.label }}</dt>
            <dd class="font-display text-xl font-semibold text-slate-900">{{ stat.value }}</dd>
          </div>
        }
      </dl>

      <p class="mt-4 text-sm text-slate-600">
        Coordinator:
        @if (c.c_first_name) {
          <span class="font-medium text-slate-900">{{ c.c_first_name }} {{ c.c_last_name }}</span>
        } @else {
          <span class="text-slate-400">none yet</span> ·
          <a routerLink="/admin/coordinators" class="link" (click)="dialogRef.close()">assign one</a>
        }
      </p>

      <h3 class="mt-5 text-sm font-semibold text-slate-900">Students</h3>
      @if (students() === null) {
        <div class="skeleton mt-2 h-24"></div>
      } @else if (students()!.length === 0) {
        <app-empty-state icon="student:duotone" title="No students yet" [compact]="true"
          description="Students join from their dashboard, or you can add them from the Students page." />
      } @else {
        <ul class="mt-2 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
          @for (s of students(); track s.id) {
            <li class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span class="truncate text-slate-900">{{ s.lastName }}, {{ s.firstName }}</span>
              <span class="shrink-0 text-xs text-slate-500">{{ s.company_name || (s.registration_status === 1 ? 'Looking for a company' : 'Registering') }}</span>
            </li>
          }
        </ul>
      }
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassDialogComponent implements OnInit {
  protected readonly c = inject<ClassProfile>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<ClassDialogComponent>);
  private readonly studentApi = inject(StudentService);

  protected readonly students = signal<StudentOjtStatus[] | null>(null);
  protected readonly stats = [
    { label: 'Students', value: this.c.students_handled },
    { label: 'Placed', value: this.c.hired_students },
    { label: 'Completed', value: this.c.practicum_completed_students },
  ];

  ngOnInit(): void {
    this.studentApi.inClass(this.c.block_name).subscribe({
      next: (res) => this.students.set([...res.payload].sort((a, b) => a.lastName.localeCompare(b.lastName))),
      error: () => this.students.set([]),
    });
  }
}
