import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { CompanyService } from '../../../core/api/company.service';
import { StudentService } from '../../../core/api/student.service';
import { CompanyStudent } from '../../../core/models/student';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

export interface AddTraineesData {
  supervisorId: number;
  companyId: number;
  /** Students already supervised by this supervisor. */
  currentIds: number[];
}

/** Students placed at the company, to take under this supervisor. Closes with true if any were added. */
@Component({
  selector: 'app-add-trainees-dialog',
  imports: [RouterLink, DialogShellComponent, IconComponent, EmptyStateComponent],
  template: `
    <app-dialog-shell title="Add trainees" description="Students placed at your company whom you’ll supervise." icon="user-plus">
      @if (students() === null) {
        <div class="space-y-2">
          <div class="skeleton h-14 rounded-xl"></div>
          <div class="skeleton h-14 rounded-xl"></div>
        </div>
      } @else if (available().length === 0) {
        <app-empty-state icon="users-three:duotone" title="No one to add" [compact]="true"
          description="Every student at your company is already on your list. To bring in someone new, invite them first.">
          <a routerLink="/supervisor/hiring" class="btn btn-secondary btn-sm" (click)="dialogRef.close(added)">Go to hiring</a>
        </app-empty-state>
      } @else {
        <ul class="space-y-2">
          @for (student of available(); track student.id) {
            <li class="flex items-center gap-3 rounded-xl p-3 ring-1 ring-slate-200">
              <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                {{ student.firstName.charAt(0) }}{{ student.lastName.charAt(0) }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-900">{{ student.firstName }} {{ student.lastName }}</p>
                <p class="text-xs text-slate-500">{{ student.program }} · {{ student.block || 'No class' }} · hired by {{ student.sFirstName }} {{ student.sLastName }}</p>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" [disabled]="busyId() !== null" (click)="add(student)">
                @if (busyId() === student.id) {
                  <app-icon name="circle-notch" [size]="14" class="animate-spin" />
                } @else {
                  <app-icon name="plus" [size]="14" />
                }
                Add
              </button>
            </li>
          }
        </ul>
      }
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTraineesDialogComponent implements OnInit {
  private readonly data = inject<AddTraineesData>(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject<MatDialogRef<AddTraineesDialogComponent, boolean>>(MatDialogRef);
  private readonly studentApi = inject(StudentService);
  private readonly companyApi = inject(CompanyService);
  private readonly toast = inject(ToastService);

  protected readonly students = signal<CompanyStudent[] | null>(null);
  private readonly addedIds = signal<number[]>([]);
  protected readonly busyId = signal<number | null>(null);
  protected added = false;

  protected readonly available = computed(() => {
    const taken = new Set([...this.data.currentIds, ...this.addedIds()]);
    return (this.students() ?? []).filter((s) => !taken.has(s.id));
  });

  ngOnInit(): void {
    this.studentApi.atCompany(this.data.companyId).subscribe({
      next: (res) => this.students.set(res.payload),
      error: () => this.students.set([]),
    });
  }

  protected add(student: CompanyStudent): void {
    this.busyId.set(student.id);
    this.companyApi.assignToSupervisor({ supervisor_id: this.data.supervisorId, student_id: student.id }).subscribe({
      next: () => {
        this.busyId.set(null);
        this.added = true;
        this.addedIds.update((ids) => [...ids, student.id]);
        this.toast.success(`${student.firstName} is now your trainee`);
      },
      error: (error) => {
        this.busyId.set(null);
        error.status === 409
          ? this.toast.info('Already your trainee')
          : this.toast.error('Couldn’t add the trainee', 'Please try again.');
      },
    });
  }
}
