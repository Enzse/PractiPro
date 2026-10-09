import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { catchError, concatMap, from, map, of, toArray } from 'rxjs';
import { ClassService } from '../../../core/api/class.service';
import { StudentService } from '../../../core/api/student.service';
import { ClassBlock } from '../../../core/models/class';
import { StudentOjtStatus } from '../../../core/models/student';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Puts the selected students in a class. Closes with true if any were moved. */
@Component({
  selector: 'app-add-to-class-dialog',
  imports: [FormsModule, OrdinalPipe, DialogShellComponent, IconComponent],
  template: `
    <app-dialog-shell title="Add to a class" [description]="students.length + (students.length === 1 ? ' student selected' : ' students selected')" icon="users-three">
      <label class="label" for="class">Class</label>
      <select id="class" class="input" [ngModel]="block()" (ngModelChange)="block.set($event)">
        <option value="" disabled>Choose a class</option>
        @for (c of classes(); track c.block_name) {
          <option [value]="c.block_name">{{ c.block_name }} · {{ c.course }} {{ c.year_level | ordinal }} year</option>
        }
      </select>

      @if (mismatched().length > 0) {
        <p class="mt-3 flex gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <app-icon name="warning-circle" [size]="16" class="mt-0.5 shrink-0" />
          {{ mismatched().length }} of the selected students {{ mismatched().length === 1 ? 'isn’t' : 'aren’t' }} in this class’s program and year.
        </p>
      }
      @if (moving().length > 0) {
        <p class="mt-3 text-sm text-slate-500">{{ moving().length }} {{ moving().length === 1 ? 'is' : 'are' }} already in another class and will be moved.</p>
      }

      <ul class="mt-4 max-h-56 space-y-1 overflow-y-auto">
        @for (s of students; track s.id) {
          <li class="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span class="truncate text-slate-900">{{ s.lastName }}, {{ s.firstName }}</span>
            <span class="shrink-0 text-xs text-slate-500">{{ s.program }} {{ s.year }} · {{ s.block || 'No class' }}</span>
          </li>
        }
      </ul>

      <footer dialogFooter class="dialog-footer">
        <button type="button" class="btn btn-secondary" (click)="dialogRef.close(false)">Cancel</button>
        <button type="button" class="btn btn-primary" [disabled]="!block() || saving()" (click)="save()">
          @if (saving()) {
            <app-icon name="circle-notch" [size]="16" class="animate-spin" />
          }
          Add to {{ block() || 'class' }}
        </button>
      </footer>
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToClassDialogComponent implements OnInit {
  protected readonly students = inject<StudentOjtStatus[]>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject<MatDialogRef<AddToClassDialogComponent, boolean>>(MatDialogRef);
  private readonly classApi = inject(ClassService);
  private readonly studentApi = inject(StudentService);
  private readonly toast = inject(ToastService);

  protected readonly classes = signal<ClassBlock[]>([]);
  protected readonly block = signal('');
  protected readonly saving = signal(false);

  private readonly chosen = computed(() => this.classes().find((c) => c.block_name === this.block()));
  protected readonly mismatched = computed(() => {
    const c = this.chosen();
    return c ? this.students.filter((s) => s.program !== c.course || Number(s.year) !== c.year_level) : [];
  });
  protected readonly moving = computed(() => this.students.filter((s) => s.block && s.block !== this.block()));

  ngOnInit(): void {
    this.classApi.all().subscribe((res) => this.classes.set(res.payload));
  }

  protected save(): void {
    const block = this.block();
    this.saving.set(true);
    from(this.students)
      .pipe(
        concatMap((s) =>
          this.studentApi.joinClass(s.id, { block_name: block }).pipe(
            map(() => true),
            catchError(() => of(false)),
          ),
        ),
        toArray(),
      )
      .subscribe((results) => {
        const moved = results.filter(Boolean).length;
        const failed = results.length - moved;
        failed === 0
          ? this.toast.success(`${moved} ${moved === 1 ? 'student' : 'students'} added to ${block}`)
          : this.toast.warning(`${moved} added, ${failed} not`, 'Some students couldn’t be added. Please try them again.');
        this.dialogRef.close(moved > 0);
      });
  }
}
