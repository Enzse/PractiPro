import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassService } from '../../../core/api/class.service';
import { UserService } from '../../../core/api/user.service';
import { ClassBlock, ClassProfile, Coordinator } from '../../../core/models/class';
import { Department } from '../../../core/models/user';
import { OrdinalPipe } from '../../../shared/pipes/ordinal.pipe';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';
import { IconComponent } from '../../../shared/ui/icon/icon.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';

/** A coordinator's department and the classes they handle. The list reloads when it closes. */
@Component({
  selector: 'app-coordinator-dialog',
  imports: [FormsModule, OrdinalPipe, DialogShellComponent, IconComponent],
  template: `
    <app-dialog-shell [title]="c.first_name + ' ' + c.last_name" [description]="c.email" icon="chalkboard-teacher">
      <div class="space-y-6">
        <div>
          <label class="label" for="department">Department</label>
          <div class="flex gap-2">
            <select id="department" class="input flex-1" [ngModel]="department()" (ngModelChange)="department.set($event)">
              @for (d of departments(); track d.code) {
                <option [value]="d.code">{{ d.name }}</option>
              }
            </select>
            <button type="button" class="btn btn-secondary" [disabled]="department() === (c.department ?? '') || savingDept()" (click)="saveDepartment()">Save</button>
          </div>
        </div>

        <div>
          <h3 class="label">Classes</h3>
          @if (classes() === null) {
            <div class="skeleton h-10"></div>
          } @else if (classes()!.length === 0) {
            <p class="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-500">No classes yet.</p>
          } @else {
            <ul class="space-y-1.5">
              @for (item of classes(); track item.block_name) {
                <li class="flex items-center gap-3 rounded-lg px-3 py-2 ring-1 ring-slate-200">
                  <span class="flex-1">
                    <span class="block text-sm font-medium text-slate-900">{{ item.block_name }}</span>
                    <span class="block text-xs text-slate-500">{{ item.course }} {{ item.year_level | ordinal }} year · {{ item.students_handled }} {{ item.students_handled === 1 ? 'student' : 'students' }}</span>
                  </span>
                  <button type="button" class="btn btn-danger-ghost btn-sm" (click)="unassign(item.block_name)">Remove</button>
                </li>
              }
            </ul>
          }
          <div class="mt-3 flex gap-2">
            <label class="sr-only" for="add-class">Class to add</label>
            <select id="add-class" class="input flex-1" [ngModel]="toAdd()" (ngModelChange)="toAdd.set($event)">
              <option value="">Add a class…</option>
              @for (option of available(); track option.block_name) {
                <option [value]="option.block_name">{{ option.block_name }} · {{ option.course }} {{ option.year_level | ordinal }} year</option>
              }
            </select>
            <button type="button" class="btn btn-primary" [disabled]="!toAdd() || assigning()" (click)="assign()">
              <app-icon name="plus" [size]="16" /> Add
            </button>
          </div>
        </div>
      </div>
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoordinatorDialogComponent implements OnInit {
  protected readonly c = inject<Coordinator>(MAT_DIALOG_DATA);
  private readonly classApi = inject(ClassService);
  private readonly userApi = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly departments = signal<Department[]>([]);
  protected readonly department = signal(this.c.department ?? '');
  protected readonly savingDept = signal(false);
  protected readonly classes = signal<ClassProfile[] | null>(null);
  private readonly allClasses = signal<ClassBlock[]>([]);
  protected readonly toAdd = signal('');
  protected readonly assigning = signal(false);

  protected readonly available = computed(() => {
    const mine = new Set((this.classes() ?? []).map((c) => c.block_name));
    return this.allClasses().filter((c) => !mine.has(c.block_name));
  });

  ngOnInit(): void {
    this.userApi.departments().subscribe((res) => this.departments.set(res.payload));
    this.classApi.all().subscribe((res) => this.allClasses.set(res.payload));
    this.loadClasses();
  }

  protected saveDepartment(): void {
    this.savingDept.set(true);
    this.userApi.updateCoordinatorDepartment(this.c.id, { department: this.department() }).subscribe({
      next: () => {
        this.savingDept.set(false);
        this.c.department = this.department();
        this.toast.success('Department updated');
      },
      error: () => {
        this.savingDept.set(false);
        this.toast.error('Couldn’t change the department', 'Please try again.');
      },
    });
  }

  protected assign(): void {
    const block = this.toAdd();
    this.assigning.set(true);
    this.classApi.assignCoordinator({ coordinator_id: this.c.id, block_name: block }).subscribe({
      next: () => {
        this.assigning.set(false);
        this.toAdd.set('');
        this.toast.success(`${this.c.first_name} now handles ${block}`);
        this.loadClasses();
      },
      error: (error) => {
        this.assigning.set(false);
        error.status === 400
          ? this.toast.warning('Already assigned', `${this.c.first_name} already handles ${block}.`)
          : this.toast.error('Couldn’t assign the class', 'Please try again.');
      },
    });
  }

  protected unassign(block: string): void {
    this.confirm
      .ask({ title: `Remove ${block} from ${this.c.first_name}?`, message: 'The class and its students stay; it just won’t have this coordinator.', confirmText: 'Remove', tone: 'danger' })
      .subscribe((yes) => {
        if (!yes) {
          return;
        }
        this.classApi.unassignCoordinator(this.c.id, block).subscribe({
          next: () => {
                this.toast.info(`${block} removed from ${this.c.first_name}`);
            this.loadClasses();
          },
          error: () => this.toast.error('Couldn’t remove the class', 'Please try again.'),
        });
      });
  }

  private loadClasses(): void {
    this.classApi.ofCoordinator(this.c.id).subscribe({
      next: (res) => this.classes.set(res.payload ?? []),
      error: () => this.classes.set([]),
    });
  }
}
